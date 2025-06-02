// src/services/IAuthService.ts
export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
  }
  
  export interface UserProfile { 
    uid: string;
    email: string | null;
  }
  
  export interface IAuthService {
    signIn(email: string, password: string): Promise<any>; // Firebase devuelve UserCredential
    signUp(email: string, password: string): Promise<any>; 
    signOut(): Promise<void>;

    onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void; // 
    getCurrentUser(): UserProfile | null;
    getUserRoles(user: UserProfile): Promise<Role[]>;
  }