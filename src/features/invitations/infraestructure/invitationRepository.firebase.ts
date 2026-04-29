import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import type { InvitationRepository } from "../app/invitationRepository.interface";
import type {
  Invitation,
  CreateInvitationDTO,
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
        return doc ? (doc.data() as Invitation) : undefined;
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
    const { userId } = this.getContext().state.user;

    const parentDocRef = doc(
      this.firestore,
      `user/${userId}/panels/${parentRef}`,
    );
    const parentSnap = await getDoc(parentDocRef);
    if (!parentSnap.exists()) {
      throw new Error(`Panel padre con id "${parentRef}" no encontrado`);
    }

    const newDocRef = doc(collection(this.firestore, collectionPath)); // ← ref nueva
    const batch = writeBatch(this.firestore);
    batch.set(newDocRef, {
      ...data,
      objRef: parentDocRef.path,
    });
    await batch.commit();

    const createdSnap = await getDoc(newDocRef); // ← leer el doc recién creado
    if (!createdSnap.exists()) {
      throw new Error("No se pudo recuperar la invitación recién creada");
    }

    return {
      id: createdSnap.id,
      objRef: newDocRef,
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
    batch.update(docRef, data);
    await batch.commit();

    const updatedSnap = await getDoc(docRef);
    if (!updatedSnap.exists()) {
      throw new Error("No se pudo recuperar la invitación actualizada");
    }

    return {
      id: updatedSnap.id,
      objRef: docRef,
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
}
