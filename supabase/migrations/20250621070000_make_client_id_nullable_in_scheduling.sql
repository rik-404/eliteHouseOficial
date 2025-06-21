-- Remove a restrição NOT NULL da coluna client_id
ALTER TABLE public.scheduling 
ALTER COLUMN client_id DROP NOT NULL;

-- Atualiza a chave estrangeira para permitir valores nulos
ALTER TABLE public.scheduling 
DROP CONSTRAINT IF EXISTS scheduling_client_id_fkey,
ADD CONSTRAINT scheduling_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;
