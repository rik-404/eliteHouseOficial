import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from './AdminLayout';
import { supabase } from '@/lib/supabase';

export const PrivateUserRoute = () => {
  const { user, loading, signOut, setUser } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>;
  }

  // Verifica se há usuário no estado e no localStorage
  const storedUser = localStorage.getItem('currentUser');
  if (!user && storedUser) {
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser && parsedUser.id) {
      // Se não houver usuário no estado mas houver no localStorage, tenta buscar do banco
      supabase
        .from('users')
        .select('*')
        .eq('id', parsedUser.id)
        .single()
        .then(({ data: userData, error }) => {
          if (error || !userData) {
            // Se houver erro ou usuário não encontrado, redireciona para login
            window.location.href = '/login';
          }

          // Se usuário existe e está ativo, atualiza o estado
          if (userData.active) {
            const userObj = {
              ...userData,
              auth_id: userData.id,
              broker_id: userData.broker_id
            };
            setUser(userObj);
          }
        });
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;

  if (user?.role === 'corretor' && window.location.pathname.includes('/admin/users')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLayout />;
};
