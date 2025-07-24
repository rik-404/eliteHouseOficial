export type SchedulingStatus = 'Agendado' | 'Confirmado' | 'Realizado' | 'Cancelado' | 'Nao_compareceu';

export interface Scheduling {
  id: string;
  titulo: string;
  descricao?: string;
  data: string; // Formato: YYYY-MM-DD
  hora: string;  // Formato: HH:MM:SS
  status: SchedulingStatus;
  client_id: string;
  broker_id: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
  };
  broker?: {
    id: string;
    name: string;
    email: string;
  };
}
