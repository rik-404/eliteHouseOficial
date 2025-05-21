-- Torna o campo email opcional na tabela clients
ALTER TABLE public.clients ALTER COLUMN email DROP NOT NULL;

-- Adiciona um comentário para documentar que o email é opcional
COMMENT ON COLUMN public.clients.email IS 'Email do cliente (opcional)';
