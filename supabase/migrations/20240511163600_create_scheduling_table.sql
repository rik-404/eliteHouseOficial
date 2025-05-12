-- Cria um tipo enum para os status de agendamento
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scheduling_status') THEN
    CREATE TYPE scheduling_status AS ENUM ('Agendado', 'Confirmado', 'Realizado', 'Cancelado', 'Nao_compareceu');
  END IF;
END$$;

-- Cria a tabela de agendamentos se não existir
CREATE TABLE IF NOT EXISTS public.scheduling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  status scheduling_status NOT NULL DEFAULT 'Agendado',
  client_id UUID NOT NULL,
  broker_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Cria as chaves estrangeiras
  CONSTRAINT fk_client
    FOREIGN KEY (client_id) 
    REFERENCES public.clients(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_broker
    FOREIGN KEY (broker_id)
    REFERENCES public.users(id)
    ON DELETE RESTRICT
);

-- Cria um gatilho para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o gatilho à tabela scheduling
DROP TRIGGER IF EXISTS update_scheduling_updated_at ON public.scheduling;
CREATE TRIGGER update_scheduling_updated_at
BEFORE UPDATE ON public.scheduling
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adiciona comentários para documentação
COMMENT ON TABLE public.scheduling IS 'Tabela de agendamentos de visitas e reuniões';
COMMENT ON COLUMN public.scheduling.titulo IS 'Título do agendamento';
COMMENT ON COLUMN public.scheduling.descricao IS 'Descrição detalhada do agendamento';
COMMENT ON COLUMN public.scheduling.data IS 'Data do agendamento';
COMMENT ON COLUMN public.scheduling.hora IS 'Hora do agendamento';
COMMENT ON COLUMN public.scheduling.status IS 'Status atual do agendamento';
COMMENT ON COLUMN public.scheduling.client_id IS 'ID do cliente relacionado ao agendamento';
COMMENT ON COLUMN public.scheduling.broker_id IS 'ID do corretor responsável pelo agendamento';
