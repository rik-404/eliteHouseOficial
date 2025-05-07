import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { ReactElement } from 'react';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import AdminLayout from './components/admin/AdminLayout';
import { PrivateUserRoute } from './components/admin/PrivateUserRoute';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import CreateUser from './pages/admin/CreateUser';
import ClientEdit from './pages/admin/ClientEdit';
import UserEdit from './pages/admin/UserEdit';
import NewClient from './pages/admin/NewClient';
import SupabaseAccess from './pages/admin/SupabaseAccess';

import Profile from './pages/admin/Profile';
import Clients from './pages/admin/Clients';

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<PrivateUserRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="users/create" element={<CreateUser />} />
              <Route path="users/:id/edit" element={<UserEdit />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:id/edit" element={<ClientEdit />} />
              <Route path="new-client/new" element={<NewClient />} />
              <Route path="supabase" element={<SupabaseAccess />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
