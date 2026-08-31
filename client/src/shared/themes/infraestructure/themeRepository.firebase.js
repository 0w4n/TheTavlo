import { doc, Firestore, getDoc, setDoc, Timestamp, updateDoc, } from "firebase/firestore";
export class FirebaseThemeRepository {
    constructor(firestore, getCurrentUser) {
        Object.defineProperty(this, "firestore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: firestore
        });
        Object.defineProperty(this, "getCurrentUser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getCurrentUser
        });
    }
    getDocPath(userId, accountType) {
        return `${accountType}/${userId}/settings/theme`;
    }
    getUser() {
        const user = this.getCurrentUser();
        if (!user)
            throw new Error("Usuario no autenticado");
        return { userId: user.id, accountType: user.accountType };
    }
    async getThemeConfig() {
        const { userId, accountType } = this.getUser();
        const docPath = this.getDocPath(userId, accountType);
        const docRef = doc(this.firestore, docPath);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists())
            return null;
        const data = docSnap.data();
        return {
            id: docSnap.id,
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
    async saveThemeConfig(config) {
        const { userId, accountType } = this.getUser();
        const docPath = this.getDocPath(userId, accountType);
        const themeData = {
            ...config,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        const docRef = doc(this.firestore, docPath);
        await setDoc(docRef, themeData);
        return {
            id: docRef.id,
            ...themeData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
    }
    async updateThemeConfig(updates) {
        const { userId, accountType } = this.getUser();
        const docPath = this.getDocPath(userId, accountType);
        const docRef = doc(this.firestore, docPath);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.fromDate(new Date()),
        });
        const updated = await this.getThemeConfig();
        if (!updated)
            throw new Error("Error al actualizar tema");
        return updated;
    }
}
