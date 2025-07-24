import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AdminThemeProvider } from "@/components/theme/AdminThemeProvider";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import { ReactElement } from 'react';
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthProvider as TempAuthProvider } from "@/contexts/TempAuthContext";
import Login from "./components/auth/Login";
import AdminLayout from './components/admin/AdminLayout';
import { PrivateUserRoute } from './components/admin/PrivateUserRoute';
import { adminRoutes } from './routes/admin.routes';
import { Skeleton } from '@/components/ui/skeleton';
import { LogsProvider } from './contexts/LogsContext';
import { InactivityWrapper } from './components/auth/InactivityWrapper';

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TempAuthProvider>
        <LogsProvider>
          <InactivityWrapper>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={
                <AdminThemeProvider>
                  <PrivateUserRoute />
                </AdminThemeProvider>
              }>
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
              <Route path="*" element={
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/sobre" element={<About />} />
                  <Route path="/contato" element={<Contact />} />
                  <Route path="/imoveis" element={<Properties />} />
                  <Route path="/imoveis/:id" element={<PropertyDetails />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              } />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
          </InactivityWrapper>
        </LogsProvider>
      </TempAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
