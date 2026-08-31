import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
import type { CookingRecipe } from "./CookingRecipe.entity";
export declare class CookingRecipeRules {
    static validateName(name: string): ResultApp<string, AppErr>;
    static validateSteps(steps: CookingRecipe["steps"]): ResultApp<CookingRecipe["steps"], AppErr>;
    static validateNeeds(needs: CookingRecipe["needs"]): ResultApp<CookingRecipe["needs"], AppErr>;
    static canToggleLike(recipe: CookingRecipe): boolean;
}
