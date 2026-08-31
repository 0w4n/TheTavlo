import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import type { Firestore, Unsubscribe } from "firebase/firestore";
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
import { withoutId } from "#core/appCore/infraestructure/firebase/withoutId";
import { cookingBookConverter, cookingRecipeConverter } from "./cookingBook.converter";

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

  private booksCollectionRef() {
    return collection(this.firestore, this.getCollectionPath()).withConverter(
      cookingBookConverter,
    );
  }

  private bookDocRef(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id).withConverter(
      cookingBookConverter,
    );
  }

  private recipesCollectionRef(cookingBookId: string) {
    return collection(
      this.firestore,
      this.getRecipeCollectionPath(cookingBookId),
    ).withConverter(cookingRecipeConverter);
  }

  private recipeDocRef(cookingBookId: string, recipeId: string) {
    return doc(
      this.firestore,
      this.getRecipeCollectionPath(cookingBookId),
      recipeId,
    ).withConverter(cookingRecipeConverter);
  }

  // ─── CookingBook: Suscripción en tiempo real ───────────────────────────────

  subscribeToCookingBooks(
    onData: (books: CookingBook[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return onSnapshot(
      query(this.booksCollectionRef()),
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  // ─── CookingBook: Queries puntuales ─────────────────────────────────────────

  async getAllCookingBooks(): Promise<CookingBook[]> {
    const snap = await getDocs(query(this.booksCollectionRef()));
    return snap.docs.map((d) => d.data());
  }

  async getCookingBook(id: string): Promise<CookingBook | null> {
    const docSnap = await getDoc(this.bookDocRef(id));
    return docSnap.exists() ? docSnap.data() : null;
  }

  // ─── CookingBook: Mutaciones ────────────────────────────────────────────────

  async createCookingBook(data: CreateCookingBookDTO): Promise<CookingBook> {
    const now = Timestamp.now();
    const payload = { ...data, createdAt: now, updatedAt: now } as CookingBook;

    const docRef = await addDoc(this.booksCollectionRef(), payload);
    return { ...payload, id: docRef.id };
  }

  async updateCookingBook(
    id: string,
    data: UpdateCookingBookDTO,
  ): Promise<CookingBook> {
    const now = Timestamp.now();
    const updateData = withoutId({ ...data, updatedAt: now });

    await updateDoc(this.bookDocRef(id), updateData);
    return { id, ...updateData } as CookingBook;
  }

  async deleteCookingBook(id: string): Promise<void> {
    await deleteDoc(this.bookDocRef(id));
  }

  // ─── CookingRecipe: Suscripción en tiempo real ─────────────────────────────

  subscribeToCookingRecipes(
    cookingBookId: string,
    onData: (recipes: CookingRecipe[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return onSnapshot(
      query(this.recipesCollectionRef(cookingBookId)),
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  // ─── CookingRecipe: Queries puntuales ───────────────────────────────────────

  async getAllCookingRecipes(cookingBookId: string): Promise<CookingRecipe[]> {
    const snap = await getDocs(query(this.recipesCollectionRef(cookingBookId)));
    return snap.docs.map((d) => d.data());
  }

  async getCookingRecipe(
    cookingBookId: string,
    recipeId: string,
  ): Promise<CookingRecipe | null> {
    const docSnap = await getDoc(this.recipeDocRef(cookingBookId, recipeId));
    return docSnap.exists() ? docSnap.data() : null;
  }

  // ─── CookingRecipe: Mutaciones ──────────────────────────────────────────────

  async createCookingRecipe(
    cookingBookId: string,
    data: CreateCookingRecipeDTO,
  ): Promise<CookingRecipe> {
    const now = Timestamp.now();
    const payload = { ...data, createdAt: now, updatedAt: now } as CookingRecipe;

    const docRef = await addDoc(this.recipesCollectionRef(cookingBookId), payload);
    return { ...payload, id: docRef.id };
  }

  async updateCookingRecipe(
    cookingBookId: string,
    recipeId: string,
    data: UpdateCookingRecipeDTO,
  ): Promise<CookingRecipe> {
    const now = Timestamp.now();
    const updateData = withoutId({ ...data, updatedAt: now });

    await updateDoc(this.recipeDocRef(cookingBookId, recipeId), updateData);
    return { id: recipeId, ...updateData } as CookingRecipe;
  }

  async deleteCookingRecipe(
    cookingBookId: string,
    recipeId: string,
  ): Promise<void> {
    await deleteDoc(this.recipeDocRef(cookingBookId, recipeId));
  }
}
