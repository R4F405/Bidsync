import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { UserProfile } from '../types/user';

// Definimos la forma de nuestro estado
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
}

// Definimos lo que el Context proveerá
interface AuthContextType extends AuthState {
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: localStorage.getItem('authToken'), // Cargamos token desde el inicio
    isAuthenticated: false,
    isLoading: true, // Empezamos cargando
    user: null,
  });

  // Efecto para validar el token al cargar la app
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // El interceptor de apiClient (apiClient.ts) ya inyecta el token
          const userProfile = await authService.getProfile();
          setAuthState({
            token: token,
            isAuthenticated: true,
            isLoading: false,
            user: userProfile,
          });
        } catch (error) {
          // El token es inválido o expiró
          console.error("Token de sesión inválido, cerrando sesión.");
          logout(); // Limpia el estado y localStorage
        }
      } else {
        // No hay token, terminamos de cargar
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    validateToken();
  }, []); // El array vacío asegura que solo se ejecute al montar

  // Función de Login
  const login = async (token: string) => {
    localStorage.setItem('authToken', token);

    try {
      // Obtenemos el perfil real inmediatamente después de guardar el token
      const userProfile = await authService.getProfile();
      setAuthState({
        token: token,
        isAuthenticated: true,
        isLoading: false,
        user: userProfile,
      });
    } catch (error) {
      console.error("Error al obtener el perfil después del login", error);
      logout();
    }
  };

  // Función de Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {/* No renderizamos la app hasta saber si estamos autenticados o no */}
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};