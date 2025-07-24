import { useEffect, useRef } from 'react';

const useInactivityReload = (inactivityTime = 5 * 60 * 1000) => {
  const timerRef = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Configura um novo timer
    timerRef.current = setTimeout(() => {
      // Verifica se o usuário está em uma página de edição
      const isOnEditPage = window.location.pathname.includes('/edit') || 
                          window.location.pathname.includes('/admin/clients/new');
      
      // Se não estiver em uma página de edição, recarrega
      if (!isOnEditPage && document.visibilityState === 'visible') {
        window.location.reload();
      } else {
        // Se estiver em uma página de edição, tenta novamente em 1 minuto
        resetTimer();
      }
    }, inactivityTime);
  };

  useEffect(() => {
    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Adiciona listeners para os eventos de atividade
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
  }, [inactivityTime]);
};

export default useInactivityReload;
