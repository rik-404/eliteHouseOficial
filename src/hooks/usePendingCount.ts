import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const usePendingCount = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*', { count: 'exact' })
          .eq('status', 'pending');

        if (error) throw error;
        setPendingCount(data?.length || 0);
      } catch (error) {
        console.error('Erro ao buscar contagem de pendentes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCount();
  }, []);

  return { pendingCount, loading };
};
