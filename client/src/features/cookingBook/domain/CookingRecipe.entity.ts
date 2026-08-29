import type { Timestamp } from "firebase/firestore";

export interface CookingRecipe {
  id: string;
  name: string;
  tags: CookingTag[];
  steps: CookingSteps[];
  needs: CookingNeeds[];
  isLiked: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CookingSteps {
  numberStep: number;
  info: string;
}

interface CookingNeeds {
  type: string;
  cuantity: number;
  icon: number;
}

interface CookingTag {
  icon:  string;
  name: string;
}

export type CreateCookingRecipeDTO = Omit<CookingRecipe, "id">;
export type UpdateCookingRecipeDTO = Partial<
  Omit<CreateCookingRecipeDTO, "createdAt">
>;
