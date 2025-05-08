import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { ReactElement } from 'react';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import AdminLayout from './components/admin/AdminLayout';
import { PrivateUserRoute } from './components/admin/PrivateUserRoute';
import { adminRoutes } from './routes/admin.routes';
import { Skeleton } from '@/components/ui/skeleton';

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
              {adminRoutes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <Skeleton className="w-full h-80" />
                      </div>
                    }>
                      {route.element}
                    </Suspense>
                  }
                />
              ))}
            </Route>

            <Route path="/" element={<Index />} />
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
