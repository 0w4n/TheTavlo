import { CookingRecipeRules } from "../domain/CookingRecipe.rules";
import { err, firebaseErr, isErr, notFoundErr, ok, validationErr, } from "#core/appCore/domain/AppCore.type";
export class CookingBookService {
    constructor(repository) {
        Object.defineProperty(this, "repository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: repository
        });
    }
    // ─── CookingBook: Suscripción ─────────────────────────────────────────────
    /**
     * Escucha los libros de recetas del panel activo en tiempo real.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribeToCookingBooks(onData, onError) {
        return this.repository.subscribeToCookingBooks(onData, onError);
    }
    // ─── CookingBook: Queries ──────────────────────────────────────────────────
    async getAllCookingBooks() {
        return this.repository.getAllCookingBooks();
    }
    async getCookingBookById(id) {
        return this.repository.getCookingBook(id);
    }
    // ─── CookingBook: Mutaciones ────────────────────────────────────────────────
    async createCookingBook(data) {
        if (!data.name || data.name.trim().length === 0) {
            return err(validationErr("El nombre del libro de recetas es requerido"));
        }
        try {
            return ok(await this.repository.createCookingBook(data));
        }
        catch {
            return err(firebaseErr("Error al crear el libro de recetas"));
        }
    }
    async updateCookingBook(id, data) {
        if (data.name !== undefined && data.name.trim().length === 0) {
            return err(validationErr("El nombre del libro de recetas es requerido"));
        }
        try {
            return ok(await this.repository.updateCookingBook(id, data));
        }
        catch {
            return err(firebaseErr("Error al actualizar el libro de recetas"));
        }
    }
    async deleteCookingBook(id) {
        try {
            await this.repository.deleteCookingBook(id);
            return ok(true);
        }
        catch {
            return err(firebaseErr(`Error al eliminar el libro de recetas con id: ${id}`));
        }
    }
    // ─── CookingRecipe: Suscripción ────────────────────────────────────────────
    /**
     * Escucha las recetas de un libro concreto en tiempo real.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribeToCookingRecipes(cookingBookId, onData, onError) {
        return this.repository.subscribeToCookingRecipes(cookingBookId, onData, onError);
    }
    // ─── CookingRecipe: Queries ─────────────────────────────────────────────────
    async getAllCookingRecipes(cookingBookId) {
        return this.repository.getAllCookingRecipes(cookingBookId);
    }
    async getCookingRecipeById(cookingBookId, recipeId) {
        return this.repository.getCookingRecipe(cookingBookId, recipeId);
    }
    // ─── CookingRecipe: Mutaciones ──────────────────────────────────────────────
    async createCookingRecipe(cookingBookId, data) {
        const nameResult = CookingRecipeRules.validateName(data.name);
        if (isErr(nameResult))
            return nameResult;
        const stepsResult = CookingRecipeRules.validateSteps(data.steps);
        if (isErr(stepsResult))
            return stepsResult;
        const needsResult = CookingRecipeRules.validateNeeds(data.needs);
        if (isErr(needsResult))
            return needsResult;
        try {
            return ok(await this.repository.createCookingRecipe(cookingBookId, data));
        }
        catch {
            return err(firebaseErr("Error al crear la receta"));
        }
    }
    async updateCookingRecipe(cookingBookId, recipeId, data) {
        if (data.name !== undefined) {
            const nameResult = CookingRecipeRules.validateName(data.name);
            if (isErr(nameResult))
                return nameResult;
        }
        if (data.steps !== undefined) {
            const stepsResult = CookingRecipeRules.validateSteps(data.steps);
            if (isErr(stepsResult))
                return stepsResult;
        }
        if (data.needs !== undefined) {
            const needsResult = CookingRecipeRules.validateNeeds(data.needs);
            if (isErr(needsResult))
                return needsResult;
        }
        try {
            return ok(await this.repository.updateCookingRecipe(cookingBookId, recipeId, data));
        }
        catch {
            return err(firebaseErr("Error al actualizar la receta"));
        }
    }
    async deleteCookingRecipe(cookingBookId, recipeId) {
        try {
            await this.repository.deleteCookingRecipe(cookingBookId, recipeId);
            return ok(true);
        }
        catch {
            return err(firebaseErr(`Error al eliminar la receta con id: ${recipeId}`));
        }
    }
    /**
     * Alterna el estado "favorito" (isLiked) de una receta.
     */
    async toggleLikeRecipe(cookingBookId, recipeId) {
        const recipe = await this.repository.getCookingRecipe(cookingBookId, recipeId);
        if (!recipe || !CookingRecipeRules.canToggleLike(recipe)) {
            return err(notFoundErr(`No se encontró la receta con id: ${recipeId}`));
        }
        try {
            return ok(await this.repository.updateCookingRecipe(cookingBookId, recipeId, {
                isLiked: !recipe.isLiked,
            }));
        }
        catch {
            return err(firebaseErr("Error al actualizar el estado de favorito"));
        }
    }
}
