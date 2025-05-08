export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
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
  created_at: string;
  updated_at: string;
}
