import type {
  AccountType,
  GuestUser,
  User,
} from "#core/auth/domain/user.entity";
import {
  doc,
  Firestore,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import type {
  CreateThemeConfigDTO,
  ThemeConfig,
  UpdateThemeConfigDTO,
} from "../domain/theme.entity";

export class FirebaseThemeRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentUser: () => User | undefined
  ) {}

  private getDocPath(userId: string, accountType: AccountType): string {
    const basePath = accountType === "guests" ? "guests" : "users";
    return `${basePath}/${userId}/settings/theme`;
  }

  private getUser(): { userId: string; accountType: AccountType } {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Usuario no autenticado");

    const userId =
      user.accountType === "guests" ? (user as GuestUser).guestId : user.id;

    return { userId, accountType: user.accountType };
  }

  async getThemeConfig(): Promise<ThemeConfig | null> {
    const { userId, accountType } = this.getUser();
    const docPath = this.getDocPath(userId, accountType);

    const docRef = doc(this.firestore, docPath);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId,
      mode: data.mode,
      preset: data.preset,
      customColors: data.customColors,
      fontSize: data.fontSize,
      borderRadius: data.borderRadius,
      animations: data.animations,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  async saveThemeConfig(config: CreateThemeConfigDTO): Promise<ThemeConfig> {
    const { userId, accountType } = this.getUser();
    const docPath = this.getDocPath(userId, accountType);

    const themeData = {
      ...config,
      userId,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    const docRef = doc(this.firestore, docPath);
    await setDoc(docRef, themeData);

    return {
      id: docRef.id,
      ...themeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateThemeConfig(updates: UpdateThemeConfigDTO): Promise<ThemeConfig> {
    const { userId, accountType } = this.getUser();
    const docPath = this.getDocPath(userId, accountType);

    const docRef = doc(this.firestore, docPath);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    const updated = await this.getThemeConfig();
    if (!updated) throw new Error("Error al actualizar tema");

    return updated;
  }
}
