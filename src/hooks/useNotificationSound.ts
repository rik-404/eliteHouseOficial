import { useRef, useEffect } from 'react';

const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Carrega o áudio quando o componente é montado
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.load();

    // Limpa o áudio quando o componente é desmontado
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reinicia o áudio se já estiver tocando
      audioRef.current.play().catch(error => {
        console.error('Erro ao reproduzir som de notificação:', error);
      });
    }
  };

  return { playNotification };
};

export default useNotificationSound;
