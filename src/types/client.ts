export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string | null;
  rg?: string | null;
  birth_date?: string | null;
  pis?: string | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  complement?: string | null;
  properties_id?: string | null;
  property_name?: string | null;
  broker_id: string;
  status: 
    | 'Novo'
    | 'Atendimento'
    | 'Análise documental'
    | 'Análise bancária'
    | 'Aprovado'
    | 'Condicionado'
    | 'Reprovado'
    | 'Venda realizada'
    | 'Distrato'
    | 'pending';
  notes: string;
  origin?: string;
  scheduling?: 'Aguardando' | 'Não realizada' | 'Realizada' | null;
  created_at: string;
  updated_at: string;
}
