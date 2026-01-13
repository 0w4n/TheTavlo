export type AccountType = "guests" | "users";

export interface User {
  id: string;
  panelIdHome: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accountType: AccountType;
  createdAt: Date;
  migratedFrom?: string; // guestId del que migró
}

export interface GuestUser extends User {
  accountType: "guests";
  guestId: string;
}

export interface GoogleUser extends User {
  accountType: "users";
  email: string;
}
