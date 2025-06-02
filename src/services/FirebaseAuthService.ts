// src/services/FirebaseAuthService.ts
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut, 
    onAuthStateChanged as firebaseOnAuthStateChanged, 
    User as FirebaseUser 
  } from 'firebase/auth';

  import { app as firebaseApp } from '../../firebase-config'; // Instancia de la app Firebase
  import { IAuthService, Role, UserProfile } from './IAuthService';
  import { FirebaseDatabaseService } from './FirebaseDatabaseService';
  import logger from './logging';
  
  const auth = getAuth(firebaseApp);
  
  export class FirebaseAuthService implements IAuthService {
    private databaseService: FirebaseDatabaseService;
  
    constructor() {
      this.databaseService = new FirebaseDatabaseService();
      logger.debug("FirebaseAuthService instanciado");
    }
  
    signIn(email: string, password: string): Promise<any> {
      logger.info(`FirebaseAuthService: Intentando iniciar sesión para ${email}`);
      return signInWithEmailAndPassword(auth, email, password);
    }
  
    async signUp(email: string, password: string): Promise<any> {
      logger.info(`FirebaseAuthService: Intentando registrar a ${email}`);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Después de registrar, asignamos roles por defecto en la base de datos

      if (userCredential.user) {
        logger.debug(`FirebaseAuthService: Usuario ${userCredential.user.uid} registrado. Asignando roles por defecto.`);
        await this.databaseService.setUserRoles(userCredential.user.uid, {
          email: userCredential.user.email,
          roles: { admin: false } // Todos los nuevos usuarios son USER por defecto
        });
      }
      return userCredential;
    }
  
    signOut(): Promise<void> {
      logger.info("FirebaseAuthService: Cerrando sesión");
      return firebaseSignOut(auth);
    }
  
    onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
      logger.debug("FirebaseAuthService: Suscribiéndose a onAuthStateChanged");
      return firebaseOnAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          logger.debug("FirebaseAuthService: Usuario autenticado detectado", { uid: firebaseUser.uid, email: firebaseUser.email });
          // Mapear FirebaseUser a nuestra UserProfile
          const userProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          };
          callback(userProfile);
        } else {
          logger.debug("FirebaseAuthService: Ningún usuario autenticado detectado");
          callback(null);
        }
      });
    }
  
    getCurrentUser(): UserProfile | null {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
      }
      return null;
    }
  
    async getUserRoles(user: UserProfile): Promise<Role[]> {
      logger.debug(`FirebaseAuthService: Obteniendo roles para usuario: ${user.email}`);
      // Regla especial para el email admin 
      if (user.email === 'admin@foodapp.com') { 
        logger.info(`FirebaseAuthService: Usuario ${user.email} es admin por email.`);
        return [Role.ADMIN, Role.USER]; // Un admin también es un usuario
      }
      // Para otros usuarios, consulta la base de datos
      return this.databaseService.getUserRoles(user.uid);
    }
  }