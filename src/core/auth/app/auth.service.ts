import type { User } from "../../auth/domain/user.entity";
import type {
  MigrationDecision,
  MigrationResult,
} from "../domain/migration.entity";
import type { GuestUser, GoogleUser } from "../domain/user.entity";
import type { AuthRepository } from "./authRepository.interface";
import type { MigrationRepository } from "./migrationRepository.interface";

export default class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private migrationRepository: MigrationRepository
  ) {}

  async signInAsGuest(): Promise<{ user?: GuestUser; error?: string }> {
    try {
      const user = await this.authRepository.signInAnonymously();
      return { user };
    } catch (error: any) {
      return { error: "Error al iniciar sesión como invitado" };
    }
  }

  async signInWithGoogle(): Promise<{ user?: GoogleUser; error?: string }> {
    try {
      const user = await this.authRepository.signInWithGoogle();
      return { user };
    } catch (error: any) {
      return { error: this.handleAuthError(error) };
    }
  }

  async upgradeToGoogle(currentGuest: GuestUser): Promise<{
    user?: GoogleUser;
    needsMigrationDecision?: boolean;
    hasExistingData?: boolean;
    error?: string;
  }> {
    try {
      // Intentar vincular cuenta de Google
      const googleUser = await this.authRepository.linkGoogleAccount(
        currentGuest
      );

      // Verificar si el usuario de Google ya tenía datos previos
      const hasExistingData = await this.migrationRepository.checkExistingData(
        googleUser.id
      );

      if (hasExistingData) {
        // Requiere decisión del usuario sobre qué hacer con los datos
        return {
          user: googleUser,
          needsMigrationDecision: true,
          hasExistingData: true,
        };
      } else {
        // No hay conflicto, mover datos automáticamente
        await this.migrationRepository.moveGuestToUser(
          currentGuest.guestId,
          googleUser.id
        );
        return { user: googleUser };
      }
    } catch (error: any) {
      return { error: this.handleAuthError(error) };
    }
  }

  async executeMigration(
    decision: MigrationDecision
  ): Promise<MigrationResult> {
    return this.migrationRepository.migrateData(decision);
  }

  getCurrentUser(): User | undefined {
    
    return this.authRepository.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: User | undefined) => void): () => void {
    return this.authRepository.onAuthStateChanged(callback);
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.authRepository.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error al cerrar sesión" };
    }
  }

  private handleAuthError(error: any): string {
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
