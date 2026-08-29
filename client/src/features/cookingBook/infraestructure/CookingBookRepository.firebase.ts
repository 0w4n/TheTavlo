import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import type { DocumentData, Firestore, Unsubscribe } from "firebase/firestore";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import type { CookingBookRepository } from "../app/CookingBook.interface";
import type {
  CookingBook,
  CreateCookingBookDTO,
  UpdateCookingBookDTO,
} from "../domain/CookingBook.entity";
import type {
  CookingRecipe,
  CreateCookingRecipeDTO,
  UpdateCookingRecipeDTO,
} from "../domain/CookingRecipe.entity";
import { firebaseErr, type AppErr } from "#core/appCore/domain/AppCore.type";

export class FirebaseCookingBookRepository implements CookingBookRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  private getCollectionPath(): string {
    const {
      user: { userId, accountType },
      panel: { panelId },
    } = this.getContext().state;

    if (panelId.length > 0) {
      // path for cookingRecipe is `${accountType}/${userId}/panels/${panelId}/cookingBook/${cookingBookId}/cookingRecipe/${cookingRecipeId}`
      return `${accountType}/${userId}/panels/${panelId}/cookingBook`;
    } else {
      return `${accountType}/${userId}/panels`;
    }
  }

  private getRecipeCollectionPath(cookingBookId: string): string {
    return `${this.getCollectionPath()}/${cookingBookId}/cookingRecipe`;
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    return ctx;
  }

  // ─── Mappers: CookingBook ──────────────────────────────────────────────────

  private mapDocumentToCookingBook(
    id: string,
    data: DocumentData,
  ): CookingBook {
    return {
      id,
      name: data.name,
      icon: data.icon,
      recipe: data.recipe ?? [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapCookingBookToDocument(data: Partial<CookingBook>): DocumentData {
    const document: DocumentData = { ...data };
    delete document.id;
    return document;
  }

  // ─── Mappers: CookingRecipe ─────────────────────────────────────────────────

  private mapDocumentToCookingRecipe(
    id: string,
    data: DocumentData,
  ): CookingRecipe {
    return {
      id,
      name: data.name,
      steps: data.steps ?? [],
      needs: data.needs ?? [],
      tags: data.tag ?? [],
      isLiked: data.isLiked ?? false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapCookingRecipeToDocument(
    data: Partial<CookingRecipe>,
  ): DocumentData {
    const document: DocumentData = { ...data };
    delete document.id;
    return document;
  }

  // ─── CookingBook: Suscripción en tiempo real ───────────────────────────────

  subscribeToCookingBooks(
    onData: (books: CookingBook[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    const q = query(collection(this.firestore, this.getCollectionPath()));

    return onSnapshot(
      q,
      (snap) => {
        const books = snap.docs.map((d) =>
          this.mapDocumentToCookingBook(d.id, d.data()),
        );
        onData(books);
      },
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  // ─── CookingBook: Queries puntuales ─────────────────────────────────────────

  async getAllCookingBooks(): Promise<CookingBook[]> {
    const q = query(collection(this.firestore, this.getCollectionPath()));
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.mapDocumentToCookingBook(d.id, d.data()));
  }

  async getCookingBook(id: string): Promise<CookingBook | null> {
    const docRef = doc(this.firestore, this.getCollectionPath(), id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return this.mapDocumentToCookingBook(docSnap.id, docSnap.data());
  }

  // ─── CookingBook: Mutaciones ────────────────────────────────────────────────

  async createCookingBook(data: CreateCookingBookDTO): Promise<CookingBook> {
    const now = Timestamp.now();
    const document = this.mapCookingBookToDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    const docRef = await addDoc(
      collection(this.firestore, this.getCollectionPath()),
      document,
    );

    return this.mapDocumentToCookingBook(docRef.id, document);
  }

  async updateCookingBook(
    id: string,
    data: UpdateCookingBookDTO,
  ): Promise<CookingBook> {
    const collectionPath = this.getCollectionPath();
    const now = Timestamp.now();
    const document = this.mapCookingBookToDocument({
      ...data,
      updatedAt: now,
    });

    const docRef = doc(this.firestore, collectionPath, id);
    await updateDoc(docRef, document);

    const updated = await this.getCookingBook(id);
    if (!updated) {
      throw new Error(`No se encontró el libro de recetas con id: ${id}`);
    }
    return updated;
  }

  async deleteCookingBook(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.getCollectionPath(), id);
    await deleteDoc(docRef);
  }

  // ─── CookingRecipe: Suscripción en tiempo real ─────────────────────────────

  subscribeToCookingRecipes(
    cookingBookId: string,
    onData: (recipes: CookingRecipe[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    const q = query(
      collection(this.firestore, this.getRecipeCollectionPath(cookingBookId)),
    );

    return onSnapshot(
      q,
      (snap) => {
        const recipes = snap.docs.map((d) =>
          this.mapDocumentToCookingRecipe(d.id, d.data()),
        );
        onData(recipes);
      },
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  // ─── CookingRecipe: Queries puntuales ───────────────────────────────────────

  async getAllCookingRecipes(cookingBookId: string): Promise<CookingRecipe[]> {
    const q = query(
      collection(this.firestore, this.getRecipeCollectionPath(cookingBookId)),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) =>
      this.mapDocumentToCookingRecipe(d.id, d.data()),
    );
  }

  async getCookingRecipe(
    cookingBookId: string,
    recipeId: string,
  ): Promise<CookingRecipe | null> {
    const docRef = doc(
      this.firestore,
      this.getRecipeCollectionPath(cookingBookId),
      recipeId,
    );
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return this.mapDocumentToCookingRecipe(docSnap.id, docSnap.data());
  }

  // ─── CookingRecipe: Mutaciones ──────────────────────────────────────────────

  async createCookingRecipe(
    cookingBookId: string,
    data: CreateCookingRecipeDTO,
  ): Promise<CookingRecipe> {
    const now = Timestamp.now();
    const document = this.mapCookingRecipeToDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    const docRef = await addDoc(
      collection(this.firestore, this.getRecipeCollectionPath(cookingBookId)),
      document,
    );

    return this.mapDocumentToCookingRecipe(docRef.id, document);
  }

  async updateCookingRecipe(
    cookingBookId: string,
    recipeId: string,
    data: UpdateCookingRecipeDTO,
  ): Promise<CookingRecipe> {
    const collectionPath = this.getRecipeCollectionPath(cookingBookId);
    const now = Timestamp.now();
    const document = this.mapCookingRecipeToDocument({
      ...data,
      updatedAt: now,
    });

    const docRef = doc(this.firestore, collectionPath, recipeId);
    await updateDoc(docRef, document);

    const updated = await this.getCookingRecipe(cookingBookId, recipeId);
    if (!updated) {
      throw new Error(`No se encontró la receta con id: ${recipeId}`);
    }
    return updated;
  }

  async deleteCookingRecipe(
    cookingBookId: string,
    recipeId: string,
  ): Promise<void> {
    const docRef = doc(
      this.firestore,
      this.getRecipeCollectionPath(cookingBookId),
      recipeId,
    );
    await deleteDoc(docRef);
  }
}
