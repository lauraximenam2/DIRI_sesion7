//Contexto de la Auth
// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService'; // Instancia del servicio
import { Role, UserProfile } from '../services/IAuthService';
import logger from '../services/logging';

interface AuthContextType {
  user: UserProfile | null;
  roles: Role[] | null;
  isLoading: boolean; //para mostrar un mensaje mientras se determina el estado de autenticación inicial
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicia como cargando

  useEffect(() => {
    logger.info("AuthProvider: Suscribiéndose a cambios de estado de autenticación.");
    setIsLoading(true);
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      logger.debug("AuthProvider: onAuthStateChanged callback ejecutado", { currentUser });
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRoles = await authService.getUserRoles(currentUser);
          setRoles(userRoles);
          logger.info("AuthProvider: Roles obtenidos para el usuario.", { uid: currentUser.uid, roles: userRoles });
        } catch (error) {
          logger.error('AuthProvider: Error al obtener los roles del usuario.', error);
          setRoles(null);
        }
      } else {
        setRoles(null);
      }
      setIsLoading(false);
    });

    // Función de limpieza 
    return () => {
      logger.info("AuthProvider: Desuscribiéndose de cambios de estado de autenticación.");
      unsubscribe();
    };
  }, []); 

  return (
    <AuthContext.Provider value={{ user, roles, isLoading }}>
      {isLoading ? <div className="loadingFallback">Verificando sesión...</div> : children}
    </AuthContext.Provider>
  );
};