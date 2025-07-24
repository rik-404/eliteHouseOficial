import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmSignOut: () => Promise<boolean>;
  confirmPassword: (password: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega o usuário quando o componente é montado
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        // Primeiro verifica o sessionStorage
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
          const parsedUser = JSON.parse(sessionUser);
          setUser(parsedUser);
          return;
        }

        // Se não houver no sessionStorage, verifica o localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verifica se o usuário ainda existe no banco de dados
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', parsedUser.id)
            .single();

          if (error) {
            console.error('Erro ao buscar usuário:', error);
            return;
          }

          if (!userData) {
            console.log('Usuário não encontrado');
            return;
          }

          if (!userData.active) {
            console.log('Usuário inativo');
            return;
          }

          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Faz login do usuário
  const signIn = async (username: string, password: string) => {
    try {
      // Buscar usuário pelo username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw new Error('Usuário não encontrado');
      }

      if (!userData) {
        console.log('Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o usuário está ativo
      if (!userData.active) {
        console.log('Usuário inativo');
        throw new Error('Usuário inativo');
      }

      // Verificar se a senha está correta
      if (userData.password !== password) {
        console.log('Senha inválida');
        throw new Error('Senha inválida');
      }

      // Armazenar usuário no estado, sessionStorage e localStorage
      const userToStore = {
        ...userData,
        auth_id: userData.id,
        broker_id: userData.broker_id
      };

      // Armazena no sessionStorage (só dura enquanto a janela estiver aberta)
      sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
      // Também armazena no localStorage (para recuperação se necessário)
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      
      setUser(userToStore);
      console.log('Usuário logado com sucesso');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  // Faz logout do usuário
  const signOut = async () => {
    try {
      // Limpa o usuário do estado, sessionStorage e localStorage
      setUser(null);
      sessionStorage.removeItem('currentUser');
      sessionStorage.clear();
      
      // Remove apenas os itens específicos do tema, mantendo outros dados importantes
      localStorage.removeItem('currentUser');
      localStorage.removeItem('admin-theme');
      
      // Redireciona para a página de login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Verifica se a senha está correta
  const confirmPassword = async (password: string) => {
    try {
      if (!user) return false;
      
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      
      const isValid = password === userData.password;
      return isValid;
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  };

  // Confirmação de logout
  const confirmSignOut = async () => {
    return new Promise<boolean>((resolve, reject) => {
      const confirmed = window.confirm('Tem certeza que deseja sair do dashboard?');
      if (confirmed) {
        signOut()
          .then(() => resolve(true))
          .catch(error => reject(error));
      } else {
        reject(new Error('Operação cancelada pelo usuário'));
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signIn, signOut, confirmSignOut, confirmPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
