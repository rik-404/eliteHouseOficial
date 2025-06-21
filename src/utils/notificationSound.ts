// Utilitário para gerenciar notificações sonoras usando a API Web Audio

// Toca um som de notificação usando a API Web Audio
export const playNotificationSound = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Cria um contexto de áudio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Cria um oscilador para gerar o som
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configura o oscilador
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Nota A5
    
    // Configura o volume
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
    
    // Conecta os nós
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Inicia e para o oscilador
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Toca um segundo tom após um pequeno intervalo
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(1318.51, audioContext.currentTime); // Nota E6
      
      const gainNode2 = audioContext.createGain();
      gainNode2.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.3);
    }, 300);
    
    console.log('Notificação sonora reproduzida');
  } catch (error) {
    console.error('Erro ao reproduzir notificação sonora:', error);
  }
};

// Não é mais necessário inicializar o áudio, pois estamos usando a API Web Audio diretamente
