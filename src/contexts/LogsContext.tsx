import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types/User';

interface Log {
  id: string;
  user_id: string;
  user_name: string;
  action: 'create' | 'update' | 'delete';
  entity_type: string;
  entity_id: string;
  entity_name: string;
  timestamp: string;
  ip_address: string;
  details: string;
  created_at: string;
  updated_at: string;
}

interface LogsContextType {
  logs: Log[];
  addLog: (log: Omit<Log, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  fetchLogs: (options?: {
    userId?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export const useLogs = () => {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error('useLogs deve ser usado dentro de um LogsProvider');
  }
  return context;
};

export const LogsProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addLog = async (logData: Omit<Log, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Garantir que o user_id seja uma string UUID válida
      const validUserId = typeof logData.user_id === 'string' && logData.user_id.length > 0 ? logData.user_id : null;
      
      if (!validUserId) {
        throw new Error('ID do usuário inválido');
      }

      const { error } = await supabase
        .from('logs')
        .insert({
          ...logData,
          user_id: validUserId,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ip_address: window.location.hostname
        });

      if (error) {
        console.error('Erro ao adicionar log:', error);
        throw error;
      }
    } catch (err) {
      console.error('Erro ao adicionar log:', err);
      setError('Erro ao registrar ação');
      throw err;
    }
  };

  const fetchLogs = async (options: {
    userId?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      setLoading(true);
      const query = supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (options.userId) {
        query.eq('user_id', options.userId);
      }
      if (options.entityType) {
        query.eq('entity_type', options.entityType);
      }
      if (options.startDate) {
        query.gte('timestamp', options.startDate);
      }
      if (options.endDate) {
        query.lte('timestamp', options.endDate);
      }
      if (options.limit !== undefined) {
        query.limit(options.limit);
      }
      if (options.offset !== undefined) {
        query.range(options.offset, options.offset + (options.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      setError('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <LogsContext.Provider value={{ logs, addLog, fetchLogs, loading, error }}>
      {children}
    </LogsContext.Provider>
  );
};

export default LogsContext;