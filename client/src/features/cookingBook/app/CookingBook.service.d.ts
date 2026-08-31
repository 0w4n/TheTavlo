import type { Unsubscribe } from "firebase/firestore";
import type { CookingBook, CreateCookingBookDTO, UpdateCookingBookDTO } from "../domain/CookingBook.entity";
import type { CookingRecipe, CreateCookingRecipeDTO, UpdateCookingRecipeDTO } from "../domain/CookingRecipe.entity";
import type { CookingBookRepository } from "./CookingBook.interface";
import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
export declare class CookingBookService {
    private repository;
    constructor(repository: CookingBookRepository);
    /**
     * Escucha los libros de recetas del panel activo en tiempo real.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribeToCookingBooks(onData: (books: CookingBook[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    getAllCookingBooks(): Promise<CookingBook[]>;
    getCookingBookById(id: string): Promise<CookingBook | null>;
    createCookingBook(data: CreateCookingBookDTO): Promise<ResultApp<CookingBook, AppErr>>;
    updateCookingBook(id: string, data: UpdateCookingBookDTO): Promise<ResultApp<CookingBook, AppErr>>;
    deleteCookingBook(id: string): Promise<ResultApp<boolean, AppErr>>;
    /**
     * Escucha las recetas de un libro concreto en tiempo real.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribeToCookingRecipes(cookingBookId: string, onData: (recipes: CookingRecipe[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    getAllCookingRecipes(cookingBookId: string): Promise<CookingRecipe[]>;
    getCookingRecipeById(cookingBookId: string, recipeId: string): Promise<CookingRecipe | null>;
    createCookingRecipe(cookingBookId: string, data: CreateCookingRecipeDTO): Promise<ResultApp<CookingRecipe, AppErr>>;
    updateCookingRecipe(cookingBookId: string, recipeId: string, data: UpdateCookingRecipeDTO): Promise<ResultApp<CookingRecipe, AppErr>>;
    deleteCookingRecipe(cookingBookId: string, recipeId: string): Promise<ResultApp<boolean, AppErr>>;
    /**
     * Alterna el estado "favorito" (isLiked) de una receta.
     */
    toggleLikeRecipe(cookingBookId: string, recipeId: string): Promise<ResultApp<CookingRecipe, AppErr>>;
}
