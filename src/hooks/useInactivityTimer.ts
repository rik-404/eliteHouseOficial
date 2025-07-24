import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos em milissegundos

export const useInactivityTimer = () => {
  const { signOut } = useAuth();
  const timerRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Configura um novo timer
    timerRef.current = setTimeout(() => {
      // Verifica se há um usuário logado antes de fazer logout
      const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null') || 
                  JSON.parse(localStorage.getItem('currentUser') || 'null');
      
      if (user) {
        console.log('Sessão expirada por inatividade');
        signOut();
      }
    }, INACTIVITY_TIMEOUT);
  }, [signOut]);

  // Configura os event listeners para detectar atividade do usuário
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Adiciona os listeners de eventos
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Inicia o timer
    resetTimer();

    // Limpa os listeners quando o componente é desmontado
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  return { resetTimer };
};
