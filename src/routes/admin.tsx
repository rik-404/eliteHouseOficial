import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Properties from '@/pages/admin/Properties';
import PropertyForm from '@/components/admin/PropertyForm';
import Users from '@/pages/admin/Users';
import CreateUser from '@/pages/admin/CreateUser';
import UserEdit from '@/pages/admin/UserEdit';
import Dashboard from '@/pages/admin/Dashboard';
import Clients from '@/pages/admin/Clients';
import ClientEdit from '@/pages/admin/ClientEdit';
import NewClient from '@/pages/admin/NewClient';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Remove todas as verificações de acesso
  return <>{children}</>;
};

export const adminRoutes = [
  {
    path: '/admin',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/properties',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/properties/new',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users/create',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users/:id/edit',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/properties/:id/edit',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
];
