import type { FirestoreDataConverter } from "firebase/firestore";
import type { CookingBook } from "../domain/CookingBook.entity";
import type { CookingRecipe } from "../domain/CookingRecipe.entity";
export declare const cookingBookConverter: FirestoreDataConverter<CookingBook>;
export declare const cookingRecipeConverter: FirestoreDataConverter<CookingRecipe>;
