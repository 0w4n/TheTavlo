export const initialCookingBookState = { status: "loading" };
export function cookingRecipeReducer(state, action) {
    switch (action.type) {
        case "FETCH_COOKINGNOOK_START":
            return { status: "loading" };
        default:
            return state;
    }
}
