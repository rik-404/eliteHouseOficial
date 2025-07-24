import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';
import { LayoutDashboard, MessageSquare, User, MoreVertical, LogOut, Users, Clock, Calendar } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { usePendingCount as useOriginalPendingCount } from '@/hooks/usePendingCount';
import useInactivityReload from '@/hooks/useInactivityReload';

// Função para obter o número de pendentes apenas para admin
const usePendingCount = () => {
  const { user } = useAuth();
  const { pendingCount, loading } = useOriginalPendingCount();
  
  if (user?.role === 'corretor') return { pendingCount: 0, loading };
  return { pendingCount, loading };
};
import NotificationBadge from '@/components/NotificationBadge';

const AdminLayout = () => {
  // Configura o recarregamento automático após 5 minutos de inatividade
  useInactivityReload(5 * 60 * 1000); // 5 minutos em milissegundos
  const navigate = useNavigate();
  const { user, confirmSignOut } = useAuth();
  const { theme, setTheme } = useTheme();
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-[#141424] dark:bg-gray-800 text-white">
        <div className="flex flex-col items-center justify-center h-24 p-4">
          <img src="/icon.png" alt="Logo" className="h-12 w-auto" />
          <span className="text-white text-sm mt-2">ImobiFlow</span>
        </div>
        <nav className="mt-4">
          <ul className="space-y-1">
            <li>
              <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-white hover:bg-[#242434] rounded transition-colors duration-200">
                <LayoutDashboard className="w-4 h-4 mr-3" />
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
              <Link to="/admin/clients" className="flex items-center px-4 py-2 text-white hover:bg-[#242434] rounded transition-colors duration-200">
                <Users className="w-4 h-4 mr-3" />
                Clientes
                {user?.role !== 'corretor' && (
                  <NotificationBadge count={pendingCount} className="ml-auto" />
                )}
              </Link>
            </li>
            <li>
              <Link to="/admin/schedule" className="flex items-center px-4 py-2 text-white hover:bg-[#242434] rounded transition-colors duration-200">
                <Calendar className="w-4 h-4 mr-3" />
                Agenda
              </Link>
            </li>
            {user?.role !== 'corretor' && (
              <li>
                <Link to="/admin/logs" className="flex items-center px-4 py-2 text-white hover:bg-[#242434] rounded transition-colors duration-200">
                  <Clock className="w-4 h-4 mr-3" />
                  Logs
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Painel Administrativo</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user?.name || user?.username}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
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
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-[calc(100vh-200px)]">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
