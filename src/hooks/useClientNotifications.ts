import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export const useClientNotifications = (onNewPendingClient: () => void) => {
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Carrega o som de notificação
    notificationSound.current = new Audio('/sounds/notification.mp3');
    notificationSound.current.load();

    // Configura a escuta em tempo real para novos clientes
    const channel = supabase
      .channel('new-clients-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients',
          filter: 'status=eq.pending'
        },
        (payload) => {
          console.log('Novo cliente pendente detectado:', payload.new);
          
          // Toca o som de notificação
          if (notificationSound.current) {
            notificationSound.current.currentTime = 0;
            notificationSound.current.play().catch(e => 
              console.error('Erro ao reproduzir notificação:', e)
            );
          }
          
          // Chama o callback para atualizar a interface
          onNewPendingClient();
        }
      )
      .subscribe();

    // Configura verificação periódica para garantir que não perca notificações
    const checkInterval = setInterval(() => {
      console.log('Verificando novos clientes pendentes...');
      onNewPendingClient();
    }, 30000); // Verifica a cada 30 segundos

    return () => {
      // Limpa a escuta e o intervalo quando o componente é desmontado
      channel.unsubscribe();
      clearInterval(checkInterval);
      if (notificationSound.current) {
        notificationSound.current.pause();
        notificationSound.current = null;
      }
    };
  }, [onNewPendingClient]);

  return {
    playNotification: () => {
      if (notificationSound.current) {
        notificationSound.current.currentTime = 0;
        notificationSound.current.play().catch(console.error);
      }
    }
  };
};
