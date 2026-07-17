import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  setDoc,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import type { InvitationRepository } from "../app/invitationRepository.interface";
import type {
  Invitation,
  CreateInvitationDTO,
  CreateSharedUserDTO,
  SharedUser,
  UpdateInvitationDTO,
} from "../domain/invitation.entity";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";

export class FirebaseInvitationRepository implements InvitationRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  private getCollectionPath(): string {
    return "shared";
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    if (!ctx) {
      throw new Error("GlobalContext no disponible");
    }
    return ctx;
  }

  async findByToken(token: string): Promise<Invitation | undefined> {
    const q = query(
      collection(this.firestore, this.getCollectionPath()),
      where("token", "==", token),
    );

    return getDocs(q)
      .then((snapshot) => {
        const doc = snapshot.docs[0];
        return doc ? ({ id: doc.id, ...doc.data() } as Invitation) : undefined;
      })
      .catch((e) => {
        throw new Error(`Error fetching invitation by token: ${e.message}`);
      });
  }

  async create(
    data: CreateInvitationDTO,
    parentRef: string,
  ): Promise<Invitation> {
    const collectionPath = this.getCollectionPath();
    // OJO: "users" (plural) — antes decía "user" y la búsqueda del panel
    // padre fallaba siempre. Además usamos el accountType real del
    // propietario (puede ser un "guest" compartiendo su propio panel),
    // en vez de asumir siempre "users".
    const { userId, accountType } = this.getContext().state.user;

    const parentDocRef = doc(
      this.firestore,
      `${accountType}/${userId}/panels/${parentRef}`,
    );
    const parentSnap = await getDoc(parentDocRef);
    if (!parentSnap.exists()) {
      throw new Error(`Panel padre con id "${parentRef}" no encontrado`);
    }

    const newDocRef = doc(collection(this.firestore, collectionPath)); // ← ref nueva
    const batch = writeBatch(this.firestore);
    batch.set(newDocRef, {
      ...data,
      // targetRef se fija aquí, en servidor/cliente de confianza, en vez de
      // confiar en lo que mande el llamador — siempre debe apuntar al panel
      // que se acaba de validar arriba.
      targetRef: parentDocRef,
    });
    await batch.commit();

    // También dejamos constancia en el propio panel para que
    // findBySharedId (collectionGroup) pueda encontrarlo por su id.
    await writeBatch(this.firestore)
      .update(parentDocRef, { sharedWith: newDocRef.id })
      .commit();

    const createdSnap = await getDoc(newDocRef); // ← leer el doc recién creado
    if (!createdSnap.exists()) {
      throw new Error("No se pudo recuperar la invitación recién creada");
    }

    return {
      id: createdSnap.id,
      ...createdSnap.data(),
    } as Invitation;
  }

  async update(id: string, data: UpdateInvitationDTO): Promise<Invitation> {
    const docRef = doc(this.firestore, this.getCollectionPath(), id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Invitación con id "${id}" no encontrada`);
    }

    const batch = writeBatch(this.firestore);
    batch.update(docRef, { ...data, updatedAt: Timestamp.now() });
    await batch.commit();

    const updatedSnap = await getDoc(docRef);
    if (!updatedSnap.exists()) {
      throw new Error("No se pudo recuperar la invitación actualizada");
    }

    return {
      id: updatedSnap.id,
      ...updatedSnap.data(),
    } as Invitation;
  }

  async delete(token: string): Promise<void> {
    const q = query(
      collection(this.firestore, this.getCollectionPath()),
      where("token", "==", token),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error(`Invitación con token "${token}" no encontrada`);
    }

    const batch = writeBatch(this.firestore);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  // ─── Sub-colección invitedUsers ───────────────────────────────────────────
  // path: shared/{invitationId}/invitedUsers/{userId}

  private invitedUsersCollectionPath(invitationId: string): string {
    return `${this.getCollectionPath()}/${invitationId}/invitedUsers`;
  }

  async findSharedUser(
    invitationId: string,
    userId: string,
  ): Promise<SharedUser | undefined> {
    const docRef = doc(
      this.firestore,
      this.invitedUsersCollectionPath(invitationId),
      userId,
    );
    const snap = await getDoc(docRef);
    if (!snap.exists()) return undefined;
    return snap.data() as SharedUser;
  }

  async listSharedUsers(invitationId: string): Promise<SharedUser[]> {
    const snap = await getDocs(
      collection(this.firestore, this.invitedUsersCollectionPath(invitationId)),
    );
    return snap.docs.map((d) => d.data() as SharedUser);
  }

  async upsertSharedUser(
    invitationId: string,
    data: CreateSharedUserDTO,
  ): Promise<SharedUser> {
    const docRef = doc(
      this.firestore,
      this.invitedUsersCollectionPath(invitationId),
      data.userId,
    );
    const existing = await getDoc(docRef);
    const now = Timestamp.now();

    const payload: SharedUser = {
      ...data,
      createdAt: existing.exists()
        ? (existing.data() as SharedUser).createdAt
        : now,
      updatedAt: now,
      statusUpdatedAt: now,
    };

    await setDoc(docRef, payload, { merge: true });
    return payload;
  }
}
