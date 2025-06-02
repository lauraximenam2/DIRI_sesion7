// src/services/IUserDatabaseService.ts
import { Role } from './IAuthService';

export interface IUserDatabaseService {
  getUserRoles(uid: string): Promise<Role[]>;
  setUserRoles(uid: string, data: { email?: string | null, roles: { admin: boolean } }): Promise<void>;
}