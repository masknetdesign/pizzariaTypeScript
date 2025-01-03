import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface Session {
  user: User | null;
  access_token: string | null;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('Verificando usuário...');
      const session = await authService.getSession();
      console.log('Sessão obtida:', session);

      if (session && session.user) {
        console.log('Usuário encontrado:', session.user);
        setUser(session.user);
      } else {
        console.log('Nenhum usuário encontrado');
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      await authService.signOut();
      setUser(null);
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpa o usuário local
      setUser(null);
    }
  };

  const contextValue: AuthContextData = {
    user,
    loading,
    setUser,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
