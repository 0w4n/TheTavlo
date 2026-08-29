import type { Timestamp } from "firebase/firestore";
import type { CookingRecipe } from "./CookingRecipe.entity";

export interface CookingBook {
  id: string;
  name: string;
  icon: string;
  recipe: CookingRecipe[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateCookingBookDTO = Omit<CookingBook, "id">;
export type UpdateCookingBookDTO = Partial<
  Omit<CreateCookingBookDTO, "createdAt">
>;
