import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const usePendingCount = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  
  // Verifica se já mostrou o popup na sessão atual
  const hasShownPopup = useRef(false);
  
  // Chave para armazenar no localStorage
  const POPUP_COOLDOWN_KEY = 'popupCooldown';
  const POPUP_COOLDOWN_TIME = 10 * 60 * 1000; // 10 minutos em milissegundos

  // Função para tocar o som de notificação
  const playNotificationSound = useCallback(() => {
    try {
      // Verifica se o usuário já interagiu com a página
      if (document.visibilityState === 'visible') {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        
        // Tenta reproduzir o áudio
        const playPromise = audio.play();
        
        // Se a reprodução for bloqueada, aguarda a interação do usuário
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('A reprodução foi bloqueada. Aguardando interação do usuário...');
            
            // Adiciona um listener para tentar reproduzir quando o usuário interagir
            const handleUserInteraction = () => {
              audio.play().catch(console.error);
              document.removeEventListener('click', handleUserInteraction);
              document.removeEventListener('keydown', handleUserInteraction);
            };
            
            document.addEventListener('click', handleUserInteraction);
            document.addEventListener('keydown', handleUserInteraction);
          });
        }
      }
    } catch (e) {
      console.error('Erro ao reproduzir notificação:', e);
    }
  }, []);

  // Efeito para verificar se deve mostrar o popup
  useEffect(() => {
    const checkPopupCooldown = () => {
      const cooldownEnd = localStorage.getItem(POPUP_COOLDOWN_KEY);
      const now = new Date().getTime();
      
      // Se não há cooldown ou o cooldown já expirou
      if (!cooldownEnd || now > parseInt(cooldownEnd)) {
        if (pendingCount > 0 && !hasShownPopup.current) {
          setShowPopup(true);
          hasShownPopup.current = true;
          playNotificationSound();
        }
        // Remove o cooldown se existir
        if (cooldownEnd) {
          localStorage.removeItem(POPUP_COOLDOWN_KEY);
        }
      }
    };
    
    // Verifica imediatamente
    checkPopupCooldown();
    
    // Configura um intervalo para verificar a cada minuto
    const intervalId = setInterval(checkPopupCooldown, 60000);
    
    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, [pendingCount, playNotificationSound]);

  // Efeito para detectar novos clientes pendentes
  useEffect(() => {
    if (pendingCount > prevCount) {
      console.log('Novo cliente pendente detectado. Contagem anterior:', prevCount, 'Nova contagem:', pendingCount);
      
      // Verifica se é um novo cliente (não apenas a primeira vez)
      if (prevCount > 0) {
        // Mostra notificação na tela
        if (Notification.permission === 'granted') {
          new Notification('Novo cliente pendente!', {
            body: 'Um novo cliente aguarda sua aprovação.',
            icon: '/logo.png'
          });
        }
        
        // Toca o som
        playNotificationSound();
        
        // Mostra o popup imediatamente para novos clientes
        setShowPopup(true);
        hasShownPopup.current = true;
        
        // Remove qualquer cooldown ativo
        localStorage.removeItem(POPUP_COOLDOWN_KEY);
      } else if (prevCount === 0) {
        // Se for o primeiro carregamento, apenas mostra o popup se não houver cooldown
        const cooldownEnd = localStorage.getItem(POPUP_COOLDOWN_KEY);
        const now = new Date().getTime();
        
        if (!cooldownEnd || now > parseInt(cooldownEnd)) {
          setShowPopup(true);
          hasShownPopup.current = true;
          playNotificationSound();
        }
      }
    }
    
    // Atualiza o contador anterior
    setPrevCount(pendingCount);
  }, [pendingCount, prevCount, playNotificationSound]);

  // Função para buscar a contagem de clientes pendentes
  const fetchPendingCount = useCallback(async () => {
    try {
      setLoading(true);
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Erro ao buscar contagem de pendentes:', error);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para configurar a escuta em tempo real para novos clientes pendentes
  useEffect(() => {
    // Solicita permissão para notificações
    if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Busca inicial
    fetchPendingCount().then(count => {
      setPendingCount(count);
    });

    // Configura a escuta em tempo real para novos clientes
    const channel = supabase
      .channel('pending-count-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients',
          filter: 'status=eq.pending'
        },
        async (payload) => {
          console.log('Novo cliente pendente detectado:', payload);
          const newCount = await fetchPendingCount();
          
          // Força a atualização do estado para garantir que o popup seja mostrado
          setPendingCount(prev => {
            // Se a contagem aumentou, mostra o popup imediatamente
            if (newCount > prev) {
              setShowPopup(true);
              hasShownPopup.current = true;
              playNotificationSound();
              
              // Mostra notificação na tela
              if (Notification.permission === 'granted') {
                new Notification('Novo cliente pendente!', {
                  body: 'Um novo cliente aguarda sua aprovação.',
                  icon: '/logo.png'
                });
              }
              
              // Remove qualquer cooldown ativo
              localStorage.removeItem(POPUP_COOLDOWN_KEY);
            }
            return newCount;
          });
        }
      )
      .subscribe((status) => {
        console.log('Status da inscrição no canal de contagem:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchPendingCount, playNotificationSound]);

  const viewPendingClients = () => {
    setShowPopup(false);
    // Navega para a página de clientes pendentes
    window.location.href = '/admin/clients?status=pending';
  };

  const closePopup = () => {
    setShowPopup(false);
    // Define um cooldown de 10 minutos
    const cooldownEnd = new Date().getTime() + POPUP_COOLDOWN_TIME;
    localStorage.setItem(POPUP_COOLDOWN_KEY, cooldownEnd.toString());
  };

  return { 
    pendingCount, 
    loading, 
    showPopup, 
    viewPendingClients, 
    closePopup 
  };
};
