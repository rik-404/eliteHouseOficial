import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const Users = lazy(() => import('../pages/admin/Users'));
const CreateUser = lazy(() => import('../pages/admin/CreateUser'));
const EditUser = lazy(() => import('../pages/admin/EditUser'));
const Profile = lazy(() => import('../pages/admin/Profile'));

export const adminRoutes = [
  {
    path: '/admin',
    element: <Navigate to="/admin/users" replace />,
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
    path: '/admin/users/edit/:id',
    element: <EditUser />
  },
  {
    path: '/admin/profile',
    element: <Profile />
  },
];
