import { supabase } from '@/lib/supabase';
import { Scheduling, SchedulingStatus } from '@/types/scheduling';

export const getSchedules = async (): Promise<Scheduling[]> => {
  const { data, error } = await supabase
    .from('scheduling')
    .select('*')
    .order('data', { ascending: true })
    .order('hora', { ascending: true });

  if (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }

  return data || [];
};

export const getSchedulesByDateRange = async (start: Date, end: Date): Promise<Scheduling[]> => {
  const { data, error } = await supabase
    .from('scheduling')
    .select('*')
    .gte('data', start.toISOString().split('T')[0])
    .lte('data', end.toISOString().split('T')[0])
    .order('data', { ascending: true })
    .order('hora', { ascending: true });

  if (error) {
    console.error('Erro ao buscar agendamentos por período:', error);
    throw error;
  }

  return data || [];
};

export const createScheduling = async (scheduling: Omit<Scheduling, 'id' | 'created_at' | 'updated_at'>): Promise<Scheduling> => {
  const { data, error } = await supabase
    .from('scheduling')
    .insert([scheduling])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }

  return data;
};

export const updateScheduling = async (id: string, updates: Partial<Scheduling>): Promise<Scheduling> => {
  const { data, error } = await supabase
    .from('scheduling')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar agendamento:', error);
    throw error;
  }

  return data;
};

export const deleteScheduling = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('scheduling')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir agendamento:', error);
    throw error;
  }
};
