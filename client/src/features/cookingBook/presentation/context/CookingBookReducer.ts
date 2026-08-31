import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type { CookingBook } from "#features/cookingBook/domain/CookingBook.entity";

export type CookingBookState =
  | {
      status: "loading";
    }
  | {
      status: "cookingBook";
      currentCookingBook: CookingBook[];
      selectedCookingBook?: CookingBook;
    }
  | {
      status: "error";
      error?: AppErr;
    };

type CookingBookAction = { type: "FETCH_COOKINGNOOK_START" };

export const initialCookingBookState: CookingBookState = { state: "loading" };

export function cookingRecipeReducer (
    state: CookingBookState,
    action: CookingBookAction
): CookingBookState {
    switch (action.type) {
        case "FETCH_COOKINGNOOK_START":
            return { status: "loading"}; 
    
        default:
            return state;
    }
}