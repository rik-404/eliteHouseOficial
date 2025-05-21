import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useRealtimeAppointments = (clientId: string) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('scheduling')
          .select('*')
          .eq('client_id', clientId)
          .order('data', { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    // Buscar os agendamentos iniciais
    fetchAppointments();

    // Configurar a subscription em tempo real
    subscription = supabase
      .channel('scheduling-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduling',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    // Limpar a subscription quando o componente for desmontado
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [clientId]);

  return { appointments, loading };
};
