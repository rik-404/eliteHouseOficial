import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Properties from '@/pages/admin/Properties';
import PropertyForm from '@/components/admin/PropertyForm';
import Users from '@/pages/admin/Users';
import CreateUser from '@/pages/admin/CreateUser';
import EditUser from '@/pages/admin/EditUser';
import Clients from '@/pages/admin/Clients';
import ClientEdit from '@/pages/admin/ClientEdit';
import NewClient from '@/pages/admin/NewClient';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Implement authentication check here
  const isAuthenticated = true; // Replace with actual auth check
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

export const adminRoutes = [
  {
    path: '/admin',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <Navigate to="/admin/properties" replace />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/properties',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <Properties />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/properties/new',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <PropertyForm />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <Users />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users/create',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <CreateUser />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users/:id/edit',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <EditUser />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/properties/:id/edit',
    element: (
      <PrivateRoute>
        <AdminLayout>
          <PropertyForm />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
];
