-- Adiciona a coluna status na tabela scheduling se ela não existir
ALTER TABLE public.scheduling 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Agendado';

-- Atualiza os registros existentes para terem um status padrão
UPDATE public.scheduling 
SET status = 'Agendado' 
WHERE status IS NULL;
