import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { protectedProcedure, publicProcedure, router } from "../../trpc/trpc.ts";
import { adminAuth, adminDb } from "../../firebase/config.ts";
import { sendInvitationEmail } from "../../services/resend.ts";
import { asEmail, asObject, asOneOf, asOneOfWithDefault, asString } from "../../trpc/validate.ts";

// Mismos valores que UserRole/AccountType del dominio en el cliente
// (client/src/features/invitations/domain/invitation.entity.ts y
// client/src/core/auth/domain/user.entity.ts). Al no ser un monorepo
// todavía, se duplican aquí a propósito — ver nota en la auditoría sobre
// mover esto a un paquete `contracts` compartido.
const USER_ROLES = ["editor", "viewer"] as const;
type UserRole = (typeof USER_ROLES)[number];

const ACCOUNT_TYPES = ["users", "guests"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

interface InviteByEmailInput {
  panelId: string;
  panelName: string;
  ownerId: string;
  ownerAccountType: AccountType;
  email: string;
  role: UserRole;
}

function parseInviteByEmailInput(raw: unknown): InviteByEmailInput {
  const v = asObject(raw);
  return {
    panelId: asString(v.panelId, "panelId"),
    panelName: asString(v.panelName, "panelName"),
    ownerId: asString(v.ownerId, "ownerId"),
    ownerAccountType: asOneOf(v.ownerAccountType, ACCOUNT_TYPES, "ownerAccountType"),
    email: asEmail(v.email),
    role: asOneOfWithDefault(v.role, USER_ROLES, "role", "viewer"),
  };
}

interface PublicLinkInput {
  panelId: string;
  ownerId: string;
  ownerAccountType: AccountType;
}

function parsePublicLinkInput(raw: unknown): PublicLinkInput {
  const v = asObject(raw);
  return {
    panelId: asString(v.panelId, "panelId"),
    ownerId: asString(v.ownerId, "ownerId"),
    ownerAccountType: asOneOf(v.ownerAccountType, ACCOUNT_TYPES, "ownerAccountType"),
  };
}

interface ResolveAccessInput {
  invitationId: string;
  token: string;
}

function parseResolveAccessInput(raw: unknown): ResolveAccessInput {
  const v = asObject(raw);
  return {
    invitationId: asString(v.invitationId, "invitationId"),
    token: asString(v.token, "token"),
  };
}

interface RespondInput {
  invitationId: string;
  token: string;
  response: "accept" | "reject";
}

function parseRespondInput(raw: unknown): RespondInput {
  const v = asObject(raw);
  return {
    invitationId: asString(v.invitationId, "invitationId"),
    token: asString(v.token, "token"),
    response: asOneOf(v.response, ["accept", "reject"] as const, "response"),
  };
}

function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

function panelDocPath(ownerAccountType: string, ownerId: string, panelId: string): string {
  return `${ownerAccountType}/${ownerId}/panels/${panelId}`;
}

function pendingByEmailId(email: string): string {
  return `pending:${email.toLowerCase()}`;
}

/**
 * thetavlo.com es ahora la landing pública; toda la app (incluida esta
 * pantalla) vive bajo /app/* en el mismo dominio (ver appRouter.tsx del
 * cliente: basename "/app"). Antes esto apuntaba a un subdominio separado
 * (app.thetavlo.app) — con el dominio único, el fallback también cambia.
 */
function invitationUrl(invitationId: string, token: string): string {
  const base = process.env.APP_BASE_URL ?? "https://thetavlo.com";
  return `${base}/app/invitation/${invitationId}?token=${token}`;
}

/**
 * `DocumentReference`/`Timestamp` de firebase-admin NO son JSON-safe tal
 * cual (el primero arrastra una referencia circular al cliente de
 * Firestore; `JSON.stringify` puede tirar "Converting circular structure
 * to JSON"). Todo lo que salga de acá hacia el cliente por tRPC/HTTP pasa
 * primero por estos serializadores.
 */
function serializeInvitation(
  id: string,
  data: FirebaseFirestore.DocumentData,
): FirebaseFirestore.DocumentData {
  const targetRef = data.targetRef as DocumentReference | undefined;
  return {
    ...data,
    id,
    targetRef: targetRef ? { path: targetRef.path } : null,
    createdAt: data.createdAt?.toMillis?.() ?? null,
    updatedAt: data.updatedAt?.toMillis?.() ?? null,
    expiresAt: data.expiresAt?.toMillis?.() ?? null,
  };
}

function serializeSharedUser(
  data: FirebaseFirestore.DocumentData,
): FirebaseFirestore.DocumentData {
  return {
    ...data,
    createdAt: data.createdAt?.toMillis?.() ?? null,
    updatedAt: data.updatedAt?.toMillis?.() ?? null,
    statusUpdatedAt: data.statusUpdatedAt?.toMillis?.() ?? null,
  };
}

/**
 * Solo el dueño del panel, o alguien ya aceptado como EDITOR en
 * `sharedPanelIndex`, puede crear/gestionar invitaciones de ese panel.
 * Un VIEWER nunca debe poder invitar a nadie ni generar enlaces.
 */
async function assertCanManageSharing(params: {
  callerUid: string;
  ownerId: string;
  panelId: string;
}): Promise<void> {
  const { callerUid, ownerId, panelId } = params;
  if (callerUid === ownerId) return;

  const idxSnap = await adminDb.doc(`sharedPanelIndex/${callerUid}/panels/${panelId}`).get();
  const role = idxSnap.exists ? (idxSnap.data()?.role as string | undefined) : undefined;

  if (role !== "editor") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Solo el dueño del panel o un editor pueden compartirlo.",
    });
  }
}

export const invitationsRouter = router({
  /**
   * Invita por correo (Q1: b+c). Si el email ya tiene cuenta en Firebase
   * Auth, queda pendiente de inmediato en su índice de "compartidos
   * conmigo" (sin depender de que abra el correo). Además siempre se
   * intenta mandar el correo con Resend con el link de invitación (si no
   * hay cuenta, ese correo es la única forma de llegar a la invitación).
   */
  inviteByEmail: protectedProcedure
    .input(parseInviteByEmailInput)
    .mutation(async ({ ctx, input }) => {
      await assertCanManageSharing({
        callerUid: ctx.user.uid,
        ownerId: input.ownerId,
        panelId: input.panelId,
      });

      const existingUser = await adminAuth.getUserByEmail(input.email).catch(() => null);
      const now = FieldValue.serverTimestamp();
      const token = generateToken();

      const invitationRef = adminDb.collection("shared").doc();
      await invitationRef.set({
        type: "share",
        objType: "panel",
        mode: "users",
        role: input.role,
        targetRef: adminDb.doc(
          panelDocPath(input.ownerAccountType, input.ownerId, input.panelId),
        ),
        token,
        createdBy: ctx.user.uid,
        lastUpdatedBy: ctx.user.uid,
        invitedEmail: input.email,
        createdAt: now,
        updatedAt: now,
        expiresAt: null,
      });

      const invitedUserDocId = existingUser?.uid ?? pendingByEmailId(input.email);
      await invitationRef.collection("invitedUsers").doc(invitedUserDocId).set({
        userId: existingUser?.uid ?? null,
        email: input.email,
        status: "pending",
        statusUpdatedAt: null,
        createdAt: now,
        updatedAt: now,
        role: input.role,
      });

      // Si ya tiene cuenta, que la vea de inmediato en su lista de paneles
      // compartidos, sin depender del correo.
      if (existingUser) {
        await adminDb.doc(`sharedPanelIndex/${existingUser.uid}/panels/${input.panelId}`).set({
          panelId: input.panelId,
          ownerId: input.ownerId,
          ownerAccountType: input.ownerAccountType,
          role: input.role,
          invitationId: invitationRef.id,
          status: "pending",
          updatedAt: now,
        });
      }

      const acceptUrl = invitationUrl(invitationRef.id, token);
      await sendInvitationEmail({
        to: input.email,
        panelName: input.panelName,
        inviterName: ctx.user.email ?? "Alguien",
        acceptUrl,
      });

      return { invitationId: invitationRef.id, hasAccount: existingUser !== null };
    }),

  /** Enlace público "cualquiera con el link puede ver" (Q1: opción c). Idempotente. */
  createPublicLink: protectedProcedure
    .input(parsePublicLinkInput)
    .mutation(async ({ ctx, input }) => {
      await assertCanManageSharing({
        callerUid: ctx.user.uid,
        ownerId: input.ownerId,
        panelId: input.panelId,
      });

      const targetRef = adminDb.doc(
        panelDocPath(input.ownerAccountType, input.ownerId, input.panelId),
      );

      const existing = await adminDb
        .collection("shared")
        .where("targetRef", "==", targetRef)
        .where("mode", "==", "link")
        .limit(1)
        .get();

      if (!existing.empty) {
        const doc = existing.docs[0]!;
        const data = doc.data();
        return {
          invitationId: doc.id,
          url: invitationUrl(doc.id, data.token as string),
        };
      }

      const now = FieldValue.serverTimestamp();
      const token = generateToken();
      const ref = adminDb.collection("shared").doc();
      await ref.set({
        type: "share",
        objType: "panel",
        mode: "link",
        role: "viewer",
        targetRef,
        token,
        createdBy: ctx.user.uid,
        lastUpdatedBy: ctx.user.uid,
        createdAt: now,
        updatedAt: now,
        expiresAt: null,
      });

      return {
        invitationId: ref.id,
        url: invitationUrl(ref.id, token),
      };
    }),

  /**
   * Qué debe mostrar la pantalla de invitación (`InvitationGate` en el
   * cliente). Es `publicProcedure` a propósito (Q5): un link privado debe
   * poder resolverse SIN sesión para saber que existe y pedir login; solo
   * `respond` (aceptar/rechazar) exige estar autenticado.
   */
  resolveAccess: publicProcedure
    .input(parseResolveAccessInput)
    .query(async ({ ctx, input }) => {
      const snap = await adminDb.collection("shared").doc(input.invitationId).get();
      if (!snap.exists) return { kind: "not-found" as const };

      const invitation = snap.data()!;
      if (invitation.token !== input.token) return { kind: "not-found" as const };
      if (invitation.expiresAt && invitation.expiresAt.toMillis() < Date.now()) {
        return { kind: "expired" as const };
      }

      const safeInvitation = serializeInvitation(snap.id, invitation);

      if (invitation.mode === "link") {
        return { kind: "public" as const, invitation: safeInvitation };
      }

      if (!ctx.user) {
        // Invitación privada pero sin sesión: el cliente debe mandar a login
        // y volver a llamar a este mismo procedure después.
        return {
          kind: "not-invited" as const,
          invitation: safeInvitation,
          requiresLogin: true,
        };
      }

      const byUidSnap = await snap.ref.collection("invitedUsers").doc(ctx.user.uid).get();
      const byEmailSnap =
        !byUidSnap.exists && ctx.user.email
          ? await snap.ref.collection("invitedUsers").doc(pendingByEmailId(ctx.user.email)).get()
          : null;
      const resolvedDoc = byUidSnap.exists ? byUidSnap : byEmailSnap;

      if (!resolvedDoc?.exists) {
        return { kind: "not-invited" as const, invitation: safeInvitation };
      }

      const sharedUser = serializeSharedUser(resolvedDoc.data()!);
      const kind =
        sharedUser.status === "accepted"
          ? ("private-accepted" as const)
          : sharedUser.status === "rejected"
            ? ("private-rejected" as const)
            : ("private-pending" as const);

      return { kind, invitation: safeInvitation, sharedUser };
    }),

  /**
   * Aceptar/rechazar una invitación privada. Exige sesión completa (Q4):
   * una cuenta anónima (`isAnonymous`) se rechaza explícitamente — primero
   * debe completar el registro con la migración ya existente en el
   * cliente (`migrationRepository`) y volver a intentarlo.
   */
  respond: protectedProcedure
    .input(parseRespondInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.isAnonymous) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Necesitas completar tu cuenta antes de aceptar una invitación.",
        });
      }

      const invRef = adminDb.collection("shared").doc(input.invitationId);
      const snap = await invRef.get();
      const invitation = snap.data();
      if (!snap.exists || !invitation || invitation.token !== input.token) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invitación no encontrada." });
      }
      if (invitation.mode !== "users") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta invitación no requiere aceptación individual.",
        });
      }

      const now = FieldValue.serverTimestamp();
      const status = input.response === "accept" ? "accepted" : "rejected";

      const byUidRef = invRef.collection("invitedUsers").doc(ctx.user.uid);
      const byEmailRef = ctx.user.email
        ? invRef.collection("invitedUsers").doc(pendingByEmailId(ctx.user.email))
        : null;
      const byEmailSnap = byEmailRef ? await byEmailRef.get() : null;
      const role = (byEmailSnap?.exists ? byEmailSnap.data()?.role : undefined) ?? invitation.role;

      const targetRef = invitation.targetRef as DocumentReference;
      const [ownerAccountType, ownerId, , panelId] = targetRef.path.split("/");
      const indexRef = adminDb.doc(`sharedPanelIndex/${ctx.user.uid}/panels/${panelId}`);

      const batch = adminDb.batch();
      batch.set(
        byUidRef,
        {
          userId: ctx.user.uid,
          email: ctx.user.email,
          status,
          statusUpdatedAt: now,
          updatedAt: now,
          role,
        },
        { merge: true },
      );
      if (byEmailSnap?.exists) batch.delete(byEmailRef!);

      if (status === "accepted") {
        batch.set(indexRef, {
          panelId,
          ownerId,
          ownerAccountType,
          role,
          invitationId: invRef.id,
          status: "accepted",
          updatedAt: now,
        });
      } else {
        batch.delete(indexRef);
      }

      await batch.commit();
      return { status };
    }),
});
