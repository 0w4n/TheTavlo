import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, Timestamp, updateDoc, } from "firebase/firestore";
import { firebaseErr } from "#core/appCore/domain/AppCore.type";
import { withoutId } from "#shared/infraestructure/firebase/withoutId";
import { cookingBookConverter, cookingRecipeConverter } from "./cookingBook.converter";
export class FirebaseCookingBookRepository {
    constructor(firestore, getCurrentContext) {
        Object.defineProperty(this, "firestore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: firestore
        });
        Object.defineProperty(this, "getCurrentContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getCurrentContext
        });
    }
    getCollectionPath() {
        const { user: { userId, accountType }, panel: { panelId }, } = this.getContext().state;
        if (panelId.length > 0) {
            // path for cookingRecipe is `${accountType}/${userId}/panels/${panelId}/cookingBook/${cookingBookId}/cookingRecipe/${cookingRecipeId}`
            return `${accountType}/${userId}/panels/${panelId}/cookingBook`;
        }
        else {
            return `${accountType}/${userId}/panels`;
        }
    }
    getRecipeCollectionPath(cookingBookId) {
        return `${this.getCollectionPath()}/${cookingBookId}/cookingRecipe`;
    }
    getContext() {
        const ctx = this.getCurrentContext();
        return ctx;
    }
    booksCollectionRef() {
        return collection(this.firestore, this.getCollectionPath()).withConverter(cookingBookConverter);
    }
    bookDocRef(id) {
        return doc(this.firestore, this.getCollectionPath(), id).withConverter(cookingBookConverter);
    }
    recipesCollectionRef(cookingBookId) {
        return collection(this.firestore, this.getRecipeCollectionPath(cookingBookId)).withConverter(cookingRecipeConverter);
    }
    recipeDocRef(cookingBookId, recipeId) {
        return doc(this.firestore, this.getRecipeCollectionPath(cookingBookId), recipeId).withConverter(cookingRecipeConverter);
    }
    // ─── CookingBook: Suscripción en tiempo real ───────────────────────────────
    subscribeToCookingBooks(onData, onError) {
        return onSnapshot(query(this.booksCollectionRef()), (snap) => onData(snap.docs.map((d) => d.data())), (error) => onError(firebaseErr(error.message, error.code, error.stack)));
    }
    // ─── CookingBook: Queries puntuales ─────────────────────────────────────────
    async getAllCookingBooks() {
        const snap = await getDocs(query(this.booksCollectionRef()));
        return snap.docs.map((d) => d.data());
    }
    async getCookingBook(id) {
        const docSnap = await getDoc(this.bookDocRef(id));
        return docSnap.exists() ? docSnap.data() : null;
    }
    // ─── CookingBook: Mutaciones ────────────────────────────────────────────────
    async createCookingBook(data) {
        const now = Timestamp.now();
        const payload = { ...data, createdAt: now, updatedAt: now };
        const docRef = await addDoc(this.booksCollectionRef(), payload);
        return { ...payload, id: docRef.id };
    }
    async updateCookingBook(id, data) {
        const now = Timestamp.now();
        const updateData = withoutId({ ...data, updatedAt: now });
        await updateDoc(this.bookDocRef(id), updateData);
        return { id, ...updateData };
    }
    async deleteCookingBook(id) {
        await deleteDoc(this.bookDocRef(id));
    }
    // ─── CookingRecipe: Suscripción en tiempo real ─────────────────────────────
    subscribeToCookingRecipes(cookingBookId, onData, onError) {
        return onSnapshot(query(this.recipesCollectionRef(cookingBookId)), (snap) => onData(snap.docs.map((d) => d.data())), (error) => onError(firebaseErr(error.message, error.code, error.stack)));
    }
    // ─── CookingRecipe: Queries puntuales ───────────────────────────────────────
    async getAllCookingRecipes(cookingBookId) {
        const snap = await getDocs(query(this.recipesCollectionRef(cookingBookId)));
        return snap.docs.map((d) => d.data());
    }
    async getCookingRecipe(cookingBookId, recipeId) {
        const docSnap = await getDoc(this.recipeDocRef(cookingBookId, recipeId));
        return docSnap.exists() ? docSnap.data() : null;
    }
    // ─── CookingRecipe: Mutaciones ──────────────────────────────────────────────
    async createCookingRecipe(cookingBookId, data) {
        const now = Timestamp.now();
        const payload = { ...data, createdAt: now, updatedAt: now };
        const docRef = await addDoc(this.recipesCollectionRef(cookingBookId), payload);
        return { ...payload, id: docRef.id };
    }
    async updateCookingRecipe(cookingBookId, recipeId, data) {
        const now = Timestamp.now();
        const updateData = withoutId({ ...data, updatedAt: now });
        await updateDoc(this.recipeDocRef(cookingBookId, recipeId), updateData);
        return { id: recipeId, ...updateData };
    }
    async deleteCookingRecipe(cookingBookId, recipeId) {
        await deleteDoc(this.recipeDocRef(cookingBookId, recipeId));
    }
}
