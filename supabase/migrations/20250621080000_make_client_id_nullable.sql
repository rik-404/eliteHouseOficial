-- Remove a restrição NOT NULL da coluna client_id
ALTER TABLE public.scheduling 
ALTER COLUMN client_id DROP NOT NULL;

-- Atualiza a chave estrangeira para permitir valores nulos
ALTER TABLE public.scheduling 
DROP CONSTRAINT IF EXISTS scheduling_client_id_fkey,
ADD CONSTRAINT scheduling_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Comentário para documentar a alteração
COMMENT ON COLUMN public.scheduling.client_id IS 'ID do cliente (opcional)';
