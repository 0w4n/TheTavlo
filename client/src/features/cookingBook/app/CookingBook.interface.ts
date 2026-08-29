import type { Unsubscribe } from "firebase/firestore";
import type { AppErr } from "#core/appCore/domain/AppCore.type";
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

export interface CookingBookRepository {
  // ─── CookingBook ──────────────────────────────────────────────────────────

  /**
   * Escucha los libros de recetas del panel activo en tiempo real.
   * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
   */
  subscribeToCookingBooks(
    onData: (books: CookingBook[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  getAllCookingBooks(): Promise<CookingBook[]>;
  getCookingBook(id: string): Promise<CookingBook | null>;
  createCookingBook(data: CreateCookingBookDTO): Promise<CookingBook>;
  updateCookingBook(
    id: string,
    data: UpdateCookingBookDTO,
  ): Promise<CookingBook>;
  deleteCookingBook(id: string): Promise<void>;

  // ─── CookingRecipe (anidada dentro de un CookingBook) ──────────────────────

  /**
   * Escucha las recetas de un libro concreto en tiempo real.
   * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
   */
  subscribeToCookingRecipes(
    cookingBookId: string,
    onData: (recipes: CookingRecipe[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  getAllCookingRecipes(cookingBookId: string): Promise<CookingRecipe[]>;
  getCookingRecipe(
    cookingBookId: string,
    recipeId: string,
  ): Promise<CookingRecipe | null>;
  createCookingRecipe(
    cookingBookId: string,
    data: CreateCookingRecipeDTO,
  ): Promise<CookingRecipe>;
  updateCookingRecipe(
    cookingBookId: string,
    recipeId: string,
    data: UpdateCookingRecipeDTO,
  ): Promise<CookingRecipe>;
  deleteCookingRecipe(cookingBookId: string, recipeId: string): Promise<void>;
}
