import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from './AdminLayout';

export const PrivateUserRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>;
  }

  if (!window.location.pathname.includes('/admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (user?.role === 'corretor' && window.location.pathname.includes('/admin/users')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <AdminLayout />
  );
};
