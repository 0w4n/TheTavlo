import { Timestamp, type Unsubscribe } from "firebase/firestore";
import { trpcMutation, trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { GlobalContextValue } from "#core/globalContext/context/globalContex.type";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import type { CookingBookRepository } from "../app/CookingBook.interface";
import type { CookingBook, CreateCookingBookDTO, UpdateCookingBookDTO } from "../domain/CookingBook.entity";
import type { CookingRecipe, CreateCookingRecipeDTO, UpdateCookingRecipeDTO } from "../domain/CookingRecipe.entity";
import { firebaseErr, type AppErr } from "#core/appCore/domain/AppCore.type";

const POLL_INTERVAL_MS = 30_000;

function scope(ctx: GlobalContextValue) {
  if (ctx.state.status !== "ready") throw new Error("GlobalContext aún no está listo");
  const owner = resolvePanelOwner(ctx);
  return { ownerId: owner.ownerId, ownerAccountType: owner.accountType, panelId: ctx.state.state.panel.panelId };
}
function hydrate<T>(raw: unknown): T {
  const value = raw as T & { createdAt: string; updatedAt: string };
  return { ...value, createdAt: Timestamp.fromDate(new Date(value.createdAt)), updatedAt: Timestamp.fromDate(new Date(value.updatedAt)) } as T;
}
function encode(data: unknown) {
  const value = data as Record<string, any>;
  return {
    ...value,
    ...(value.createdAt ? { createdAt: value.createdAt.toDate().toISOString() } : {}),
    ...(value.updatedAt ? { updatedAt: value.updatedAt.toDate().toISOString() } : {}),
  };
}
function errorOf(error: unknown): AppErr { return firebaseErr(error instanceof Error ? error.message : "Error al consultar el recetario"); }

export class TrpcCookingBookRepository implements CookingBookRepository {
  constructor(private getContext: () => GlobalContextValue) {}
  private async books(): Promise<CookingBook[]> {
    const result = await trpcQuery<unknown[]>("cookingBook.books", scope(this.getContext()));
    return result.map((book) => hydrate<CookingBook>(book));
  }
  private poll<T>(load: () => Promise<T>, onData: (value: T) => void, onError: (error: AppErr) => void): Unsubscribe {
    let stopped = false;
    const refresh = async () => { try { const value = await load(); if (!stopped) onData(value); } catch (error) { if (!stopped) onError(errorOf(error)); } };
    void refresh();
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => { stopped = true; window.clearInterval(timer); };
  }
  subscribeToCookingBooks(onData: (books: CookingBook[]) => void, onError: (error: AppErr) => void): Unsubscribe { return this.poll(() => this.books(), onData, onError); }
  getAllCookingBooks(): Promise<CookingBook[]> { return this.books(); }
  async getCookingBook(id: string): Promise<CookingBook | null> {
    const result = await trpcQuery<unknown | null>("cookingBook.book", { ...scope(this.getContext()), id });
    return result ? hydrate<CookingBook>(result) : null;
  }
  async createCookingBook(data: CreateCookingBookDTO): Promise<CookingBook> { return hydrate(await trpcMutation("cookingBook.createBook", { ...scope(this.getContext()), data: encode(data) })); }
  async updateCookingBook(id: string, data: UpdateCookingBookDTO): Promise<CookingBook> { return hydrate(await trpcMutation("cookingBook.updateBook", { ...scope(this.getContext()), id, data: encode(data) })); }
  async deleteCookingBook(id: string): Promise<void> { await trpcMutation("cookingBook.removeBook", { ...scope(this.getContext()), id }); }
  private async recipes(cookingBookId: string): Promise<CookingRecipe[]> {
    const result = await trpcQuery<unknown[]>("cookingBook.recipes", { ...scope(this.getContext()), cookingBookId });
    return result.map((recipe) => hydrate<CookingRecipe>(recipe));
  }
  subscribeToCookingRecipes(cookingBookId: string, onData: (recipes: CookingRecipe[]) => void, onError: (error: AppErr) => void): Unsubscribe { return this.poll(() => this.recipes(cookingBookId), onData, onError); }
  getAllCookingRecipes(cookingBookId: string): Promise<CookingRecipe[]> { return this.recipes(cookingBookId); }
  async getCookingRecipe(cookingBookId: string, recipeId: string): Promise<CookingRecipe | null> {
    const result = await trpcQuery<unknown | null>("cookingBook.recipe", { ...scope(this.getContext()), cookingBookId, id: recipeId });
    return result ? hydrate<CookingRecipe>(result) : null;
  }
  async createCookingRecipe(cookingBookId: string, data: CreateCookingRecipeDTO): Promise<CookingRecipe> { return hydrate(await trpcMutation("cookingBook.createRecipe", { ...scope(this.getContext()), cookingBookId, data: encode(data) })); }
  async updateCookingRecipe(cookingBookId: string, recipeId: string, data: UpdateCookingRecipeDTO): Promise<CookingRecipe> { return hydrate(await trpcMutation("cookingBook.updateRecipe", { ...scope(this.getContext()), cookingBookId, id: recipeId, data: encode(data) })); }
  async deleteCookingRecipe(cookingBookId: string, recipeId: string): Promise<void> { await trpcMutation("cookingBook.removeRecipe", { ...scope(this.getContext()), cookingBookId, id: recipeId }); }
}
