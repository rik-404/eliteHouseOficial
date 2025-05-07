import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

import { User } from '@/types/user';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmSignOut: () => Promise<boolean>;
  confirmPassword: (password: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Tentando buscar usuário:', username);
      
      // Get user from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw userError;
      }
      if (!userData) {
        console.log('Usuário não encontrado');
        throw new Error('Usuário não encontrado');
      }
      console.log('Usuário encontrado:', userData);

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, userData.password);
      
      if (!isValidPassword) {
        console.log('Senha inválida');
        throw new Error('Senha inválida');
      }
      console.log('Senha verificada com sucesso');

      // Verify user status
      if (!userData.active) {
        console.log('Usuário inativo');
        throw new Error('Usuário inativo');
      }

      // Store user in state and localStorage
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('Usuário logado com sucesso');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const confirmPassword = async (password: string) => {
    try {
      if (!user) return false;
      
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      
      const isValid = await bcrypt.compare(password, userData.password);
      return isValid;
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  };

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
    <AuthContext.Provider value={{ user, loading, signIn, signOut, confirmSignOut, confirmPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
