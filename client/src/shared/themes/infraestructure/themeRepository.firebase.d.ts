import type { User } from "#core/auth/domain/user.entity";
import { Firestore } from "firebase/firestore";
import type { CreateThemeConfigDTO, ThemeConfig, UpdateThemeConfigDTO } from "../domain/theme.entity";
export declare class FirebaseThemeRepository {
    private firestore;
    private getCurrentUser;
    constructor(firestore: Firestore, getCurrentUser: () => User | undefined);
    private getDocPath;
    private getUser;
    getThemeConfig(): Promise<ThemeConfig | null>;
    saveThemeConfig(config: CreateThemeConfigDTO): Promise<ThemeConfig>;
    updateThemeConfig(updates: UpdateThemeConfigDTO): Promise<ThemeConfig>;
}
