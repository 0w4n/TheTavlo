export function authReducer(state, action) {
    switch (action.type) {
        case "AUTH_STATE_CHANGED":
            if (!action.payload) {
                return {
                    status: "unauthenticated",
                };
            }
            return {
                status: "authenticated",
                user: action.payload,
                migrationPending: false,
                migrationData: null,
            };
        case "AUTH_ERROR":
            return {
                status: "error",
                error: action.payload,
            };
        case "MIGRATION_PENDING":
            if (state.status !== "authenticated") {
                return state;
            }
            return {
                status: "migration-pending",
                user: state.user,
                migrationPending: true,
                migrationData: action.payload,
            };
        case "MIGRATION_COMPLETED":
            if (state.status !== "migration-pending") {
                return state;
            }
            return {
                status: "authenticated",
                user: state.user,
                migrationPending: false,
                migrationData: null,
            };
        case "CLEAR_ERROR":
            return {
                status: "unauthenticated",
            };
        default:
            return state;
    }
}
