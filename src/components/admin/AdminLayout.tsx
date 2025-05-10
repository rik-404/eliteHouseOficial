import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare, User, MoreVertical, LogOut } from 'lucide-react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePendingCount as useOriginalPendingCount } from '@/hooks/usePendingCount';

// Função para obter o número de pendentes apenas para admin
const usePendingCount = () => {
  const { user } = useAuth();
  const { pendingCount, loading } = useOriginalPendingCount();
  
  if (user?.role === 'corretor') return { pendingCount: 0, loading };
  return { pendingCount, loading };
};
import NotificationBadge from '@/components/NotificationBadge';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, confirmSignOut } = useAuth();
  const { pendingCount, loading } = usePendingCount();

  const handleLogout = async () => {
    try {
      const confirmed = await confirmSignOut();
      if (confirmed) {
        navigate('/login');
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'Operação cancelada pelo usuário') {
        console.error('Erro ao sair:', error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#141424] text-white">
        <div className="flex items-center justify-center h-24 p-4">
          <img src="/icon.png" alt="Logo" className="h-12 w-auto" />
        </div>
        <nav className="mt-4">
          <ul className="space-y-1">
            <li>
              <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-white hover:bg-[#242434] rounded transition-colors duration-200">
                <Home className="w-4 h-4 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/properties" className="flex items-center px-4 py-2 text-white hover:bg-[#242434] rounded transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Imóveis
              </Link>
            </li>
            {user?.role !== 'corretor' && (
              <li>
                <Link to="/admin/users" className="flex items-center px-4 py-2 text-white hover:bg-[#242434] rounded transition-colors duration-200">
                  <User className="w-4 h-4 mr-3" />
                  Usuários
                </Link>
              </li>
            )}
            <li>
              <Link to="/admin/clients" className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors duration-200">
                <User className="w-4 h-4 mr-3" />
                Clientes
                {user?.role !== 'corretor' && (
                  <NotificationBadge count={pendingCount} className="ml-auto" />
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-lg font-semibold text-gray-900">Painel Administrativo</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {user?.name || user?.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.role}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/admin/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
