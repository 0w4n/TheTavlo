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
  CreatedInvitationDTO,
  CreatedSharedUserDTO,
  SharedUser,
  UpdatedInvitationDTO,
} from "../domain/invitation.entity";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { invitationConverter, sharedUserConverter } from "./invitation.converter";

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

  private collectionRef() {
    return collection(this.firestore, this.getCollectionPath()).withConverter(
      invitationConverter,
    );
  }

  private docRef(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id).withConverter(
      invitationConverter,
    );
  }

  async findByToken(token: string): Promise<Invitation | undefined> {
    const q = query(this.collectionRef(), where("token", "==", token));

    return getDocs(q)
      .then((snapshot) => snapshot.docs[0]?.data())
      .catch((e) => {
        throw new Error(`Error fetching invitation by token: ${e.message}`);
      });
  }

  async create(
    data: CreatedInvitationDTO,
    parentRef: string,
  ): Promise<Invitation> {
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

    const newDocRef = doc(this.collectionRef()); // ← ref nueva, ya tipada
    const payload = {
      ...data,
      // targetRef se fija aquí, en servidor/cliente de confianza, en vez de
      // confiar en lo que mande el llamador — siempre debe apuntar al panel
      // que se acaba de validar arriba.
      targetRef: parentDocRef,
    } as unknown as Invitation;

    const batch = writeBatch(this.firestore);
    batch.set(newDocRef, payload);
    await batch.commit();

    // También dejamos constancia en el propio panel para que
    // findBySharedId (collectionGroup) pueda encontrarlo por su id.
    await writeBatch(this.firestore)
      .update(parentDocRef, { sharedWith: newDocRef.id })
      .commit();

    return { ...payload, id: newDocRef.id };
  }

  async update(id: string, data: UpdatedInvitationDTO): Promise<Invitation> {
    const docRef = this.docRef(id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Invitación con id "${id}" no encontrada`);
    }

    const updateData = { ...data, updatedAt: Timestamp.now() };
    const batch = writeBatch(this.firestore);
    batch.update(docRef, updateData);
    await batch.commit();

    return { ...docSnap.data(), ...updateData, id };
  }

  async delete(token: string): Promise<void> {
    const q = query(this.collectionRef(), where("token", "==", token));

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

  private invitedUsersCollectionRef(invitationId: string) {
    return collection(
      this.firestore,
      this.invitedUsersCollectionPath(invitationId),
    ).withConverter(sharedUserConverter);
  }

  private invitedUserDocRef(invitationId: string, userId: string) {
    return doc(
      this.firestore,
      this.invitedUsersCollectionPath(invitationId),
      userId,
    ).withConverter(sharedUserConverter);
  }

  async findSharedUser(
    invitationId: string,
    userId: string,
  ): Promise<SharedUser | undefined> {
    const snap = await getDoc(this.invitedUserDocRef(invitationId, userId));
    return snap.exists() ? snap.data() : undefined;
  }

  async listSharedUsers(invitationId: string): Promise<SharedUser[]> {
    const snap = await getDocs(this.invitedUsersCollectionRef(invitationId));
    return snap.docs.map((d) => d.data());
  }

  async upsertSharedUser(
    invitationId: string,
    data: CreatedSharedUserDTO,
  ): Promise<SharedUser> {
    const docRef = this.invitedUserDocRef(invitationId, data.userId);
    const existing = await getDoc(docRef);
    const now = Timestamp.now();

    const payload: SharedUser = {
      ...data,
      createdAt: existing.exists() ? existing.data().createdAt : now,
      updatedAt: now,
      statusUpdatedAt: now,
    };

    await setDoc(docRef, payload, { merge: true });
    return payload;
  }
}
