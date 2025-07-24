import { useEffect } from 'react';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';

export const InactivityWrapper = ({ children }: { children: React.ReactNode }) => {
  useInactivityTimer();
  
  // Não renderiza nada além dos children
  return <>{children}</>;
};
