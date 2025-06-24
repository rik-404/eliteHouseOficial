-- Adiciona os campos birth_date, pis e rg à tabela clients

-- Adiciona a coluna birth_date (data de nascimento)
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS birth_date DATE NULL;

-- Adiciona a coluna pis (PIS/NIS)
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS pis VARCHAR(14) NULL;

-- Adiciona a coluna rg (Registro Geral)
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS rg VARCHAR(14) NULL;

-- Adiciona comentários para documentação
COMMENT ON COLUMN public.clients.birth_date IS 'Data de nascimento do cliente';
COMMENT ON COLUMN public.clients.pis IS 'Número do PIS/NIS do cliente';
COMMENT ON COLUMN public.clients.rg IS 'Número do Registro Geral (RG) do cliente';

-- Cria índices para melhorar a performance das buscas
CREATE INDEX IF NOT EXISTS idx_clients_birth_date ON public.clients(birth_date);
CREATE INDEX IF NOT EXISTS idx_clients_pis ON public.clients(pis);
CREATE INDEX IF NOT EXISTS idx_clients_rg ON public.clients(rg);
