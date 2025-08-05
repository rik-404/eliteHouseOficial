import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Componente para verificar se o usuário tem permissão para acessar os logs
const ProtectedActivityLogs = () => {
  const { user } = useAuth();
  
  // Se o usuário for corretor, redireciona para o dashboard
  if (user?.role === 'corretor') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Caso contrário, mostra os logs
  return <ActivityLogs />;
};

const ActivityLogs = lazy(() => import('../pages/admin/ActivityLogs').then(module => ({ default: module.ActivityLogs })));

const ActivityLogsPage = () => (
  <ActivityLogs />
);
const contact = lazy(() => import('../pages/Contact'));
const about = lazy(() => import('../pages/About'));
const buy = lazy(() => import('../pages/Properties'));


const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Users = lazy(() => import('../pages/admin/Users'));
const CreateUser = lazy(() => import('../pages/admin/CreateUser'));
const UserEdit = lazy(() => import('../pages/admin/UserEdit'));
const Profile = lazy(() => import('../pages/admin/Profile'));
const Properties = lazy(() => import('../pages/admin/Properties').then(module => ({ default: module.Properties })));

const CreateProperty = lazy(() => import('../pages/admin/CreateProperty'));
const EditProperty = lazy(() => import('../pages/admin/EditProperty'));
const Clients = lazy(() => import('../pages/admin/Clients'));
const EditClient = lazy(() => import('../pages/admin/EditClient'));
const NewClient = lazy(() => import('../pages/admin/NewClient'));
const SupabaseAccess = lazy(() => import('../pages/admin/SupabaseAccess'));
const ClientEdit = lazy(() => import('../pages/admin/ClientEdit'));
const NewTask = lazy(() => import('../pages/admin/NewTask'));
const Schedule = lazy(() => import('../pages/admin/Schedule'));

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/dashboard',
    element: <Dashboard />
  },
  {
    path: '/admin/users',
    element: <Users />
  },
  {
    path: '/admin/users/create',
    element: <CreateUser />
  },
  {
    path: '/admin/users/:id/edit',
    element: <UserEdit />
  },
  {
    path: '/admin/profile',
    element: <Profile />
  },
  {
    path: '/admin/logs',
    element: <ProtectedActivityLogs />
  },
  {
    path: '/admin/properties',
    element: <Properties />
  },
  {
    path: '/admin/properties/new',
    element: <CreateProperty />
  },
  {
    path: '/admin/properties/:id/edit',
    element: <EditProperty />
  },
  {
    path: '/admin/clients',
    element: <Clients />
  },
  {
    path: '/admin/clients/new',
    element: <NewClient />
  },
  {
    path: '/admin/clients/:id/edit',
    element: <EditClient />
  },
  {
    path: '/admin/tasks/new',
    element: <NewTask />
  },
  {
    path: '/admin/clients/new-task',
    element: <NewTask />
  },
  {
    path: '/admin/schedule',
    element: <Schedule />
  },
  {
    path: '/admin/clients/edit/:id',
    element: <ClientEdit />
  },
  {
    path: '/admin/supabase',
    element: <SupabaseAccess />
  }
];
