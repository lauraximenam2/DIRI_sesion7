// src/services/FirebaseDatabaseService.ts
import { ref, get, set } from 'firebase/database';
import { db as firebaseDB } from '../../firebase-config'; // Usamos la instancia db de firebase-config
import { Role } from './IAuthService';
import { IUserDatabaseService } from './IUserDatabaseService';
import logger from './logging';

export class FirebaseDatabaseService implements IUserDatabaseService {
  async getUserRoles(uid: string): Promise<Role[]> {
    logger.debug(`FirebaseDatabaseService: Intentando obtener roles para UID: ${uid}`);
    try {
      const rolesRef = ref(firebaseDB, `userRoles/${uid}/roles`);
      const snapshot = await get(rolesRef);
      if (snapshot.exists()) {
        const rolesData = snapshot.val(); 
        const roles: Role[] = [];
        if (rolesData && rolesData.admin === true) {
          roles.push(Role.ADMIN);
          logger.info(`FirebaseDatabaseService: Usuario ${uid} tiene rol ADMIN.`);
        }
 
        if (roles.length === 0) {
          roles.push(Role.USER);
          logger.info(`FirebaseDatabaseService: Usuario ${uid} tiene rol USER por defecto.`);
        }
        return roles;
      }

      logger.warn(`FirebaseDatabaseService: No se encontraron roles para UID: ${uid}. Asignando rol USER por defecto.`);
      return [Role.USER]; // Rol por defecto si no hay entrada

    } catch (error) {
      logger.error(`FirebaseDatabaseService: Error obteniendo roles para UID: ${uid}`, error);
      throw error; 
    }
  }

  async setUserRoles(uid: string, data: { email?: string | null, roles: { admin: boolean } }): Promise<void> {
    logger.debug(`FirebaseDatabaseService: Estableciendo roles para UID: ${uid}`, data);
    try {
      // Guardaremos el email también para referencia, y la estructura de roles
      const userRolesRef = ref(firebaseDB, `userRoles/${uid}`);
      await set(userRolesRef, {
        email: data.email || 'No proporcionado', 
        roles: data.roles, 
      });
      logger.info(`FirebaseDatabaseService: Roles establecidos para UID: ${uid}`);
    } catch (error) {
      logger.error(`FirebaseDatabaseService: Error estableciendo roles para UID: ${uid}`, error);
      throw error;
    }
  }
}