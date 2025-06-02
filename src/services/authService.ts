// Instancia del Servicio de Autenticación
// src/services/authService.ts
import { FirebaseAuthService } from './FirebaseAuthService';
import { IAuthService } from './IAuthService';


export const authService: IAuthService = new FirebaseAuthService();