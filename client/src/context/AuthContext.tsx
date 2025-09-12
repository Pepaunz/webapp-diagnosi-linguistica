import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { setUnauthorizedCallback } from '../services/utilsApi';
import { LoginInput } from '@bilinguismo/shared';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    authApi.logout();
    setToken(null);
    setIsAuthenticated(false);
    navigate('/login'); // Reindirizza al login
  };

  // Inizializza lo stato dall'localStorage
  useEffect(() => {
    setUnauthorizedCallback(logout);
    const savedToken = authApi.getToken();
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginInput) => {
    const response = await authApi.login(credentials);
    const newToken = response.access_token;
    authApi.saveToken(newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };



  const value: AuthContextType = {
    isAuthenticated,
    token,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};