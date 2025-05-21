-- Torna o campo email opcional na tabela users
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Adiciona um comentário para documentar que o email é opcional
COMMENT ON COLUMN public.users.email IS 'Email do usuário (opcional)';
