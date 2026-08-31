export default class AuthService {
    constructor(authRepository, migrationRepository) {
        Object.defineProperty(this, "authRepository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: authRepository
        });
        Object.defineProperty(this, "migrationRepository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: migrationRepository
        });
    }
    async signInAsGuest() {
        try {
            const user = await this.authRepository.signInAnonymously();
            return { user };
        }
        catch (error) {
            return { error: "Error al iniciar sesión como invitado" };
        }
    }
    async signInWithGoogle() {
        try {
            const user = await this.authRepository.signInWithGoogle();
            return { user };
        }
        catch (error) {
            return { error: this.handleAuthError(error) };
        }
    }
    async upgradeToGoogle(currentGuest) {
        try {
            // Intentar vincular cuenta de Google
            const googleUser = await this.authRepository.linkGoogleAccount(currentGuest);
            // Verificar si el usuario de Google ya tenía datos previos
            const hasExistingData = await this.migrationRepository.checkExistingData(googleUser.id);
            if (hasExistingData) {
                // Requiere decisión del usuario sobre qué hacer con los datos
                return {
                    user: googleUser,
                    needsMigrationDecision: true,
                    hasExistingData: true,
                };
            }
            else {
                // No hay conflicto, mover datos automáticamente
                await this.migrationRepository.moveGuestToUser(currentGuest.guestId, googleUser.id);
                return { user: googleUser };
            }
        }
        catch (error) {
            return { error: this.handleAuthError(error) };
        }
    }
    async executeMigration(decision) {
        return this.migrationRepository.migrateData(decision);
    }
    getCurrentUser() {
        return this.authRepository.getCurrentUser();
    }
    onAuthStateChanged(callback) {
        return this.authRepository.onAuthStateChanged(callback);
    }
    async signOut() {
        try {
            await this.authRepository.signOut();
            return { success: true };
        }
        catch (error) {
            return { success: false, error: "Error al cerrar sesión" };
        }
    }
    handleAuthError(error) {
        const errorCode = error.code;
        switch (errorCode) {
            case "auth/popup-closed-by-user":
                return "Inicio de sesión cancelado";
            case "auth/popup-blocked":
                return "Popup bloqueado. Permite popups para este sitio";
            case "auth/account-exists-with-different-credential":
                return "Ya existe una cuenta con este email";
            case "auth/credential-already-in-use":
                return "Esta cuenta de Google ya está en uso";
            default:
                return "Error de autenticación";
        }
    }
}
