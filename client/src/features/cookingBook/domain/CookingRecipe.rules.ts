import {
  err,
  ok,
  validationErr,
  type AppErr,
  type ResultApp,
} from "#core/appCore/domain/AppCore.type";
import type { CookingRecipe } from "./CookingRecipe.entity";

export class CookingRecipeRules {
  static validateName(name: string): ResultApp<string, AppErr> {
    if (!name || name.trim().length === 0) {
      return err(validationErr("El nombre de la receta es requerido"));
    }
    if (name.length > 100) {
      return err(
        validationErr("El nombre de la receta no puede exceder 100 caracteres"),
      );
    }
    return ok(name);
  }

  static validateSteps(
    steps: CookingRecipe["steps"],
  ): ResultApp<CookingRecipe["steps"], AppErr> {
    if (!steps || steps.length === 0) {
      return err(
        validationErr("La receta debe tener al menos un paso de preparación"),
      );
    }

    const stepNumbers = steps.map((step) => step.numberStep);
    const hasDuplicateStepNumbers =
      new Set(stepNumbers).size !== stepNumbers.length;
    if (hasDuplicateStepNumbers) {
      return err(
        validationErr(
          "Los pasos de la receta no pueden repetir el mismo número",
        ),
      );
    }

    const hasEmptyStepInfo = steps.some(
      (step) => !step.info || step.info.trim().length === 0,
    );
    if (hasEmptyStepInfo) {
      return err(validationErr("Todos los pasos deben tener una descripción"));
    }

    return ok(steps);
  }

  static validateNeeds(
    needs: CookingRecipe["needs"],
  ): ResultApp<CookingRecipe["needs"], AppErr> {
    if (!needs || needs.length === 0) {
      return err(
        validationErr(
          "La receta debe tener al menos un ingrediente o utensilio",
        ),
      );
    }

    const hasInvalidQuantity = needs.some((need) => need.cuantity <= 0);
    if (hasInvalidQuantity) {
      return err(
        validationErr("La cantidad de cada elemento debe ser mayor a cero"),
      );
    }

    const hasEmptyType = needs.some(
      (need) => !need.type || need.type.trim().length === 0,
    );
    if (hasEmptyType) {
      return err(
        validationErr(
          "Todos los ingredientes o utensilios deben tener un tipo",
        ),
      );
    }

    return ok(needs);
  }

  static canToggleLike(recipe: CookingRecipe): boolean {
    return recipe !== undefined && recipe !== null;
  }
}
