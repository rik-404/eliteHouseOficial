-- Torna os campos de endereço opcionais na tabela clients
ALTER TABLE public.clients 
ALTER COLUMN cep DROP NOT NULL,
ALTER COLUMN street DROP NOT NULL,
ALTER COLUMN number DROP NOT NULL,
ALTER COLUMN neighborhood DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL;

-- Adiciona comentários para documentar que os campos são opcionais
COMMENT ON COLUMN public.clients.cep IS 'CEP do cliente (opcional)';
COMMENT ON COLUMN public.clients.street IS 'Rua do cliente (opcional)';
COMMENT ON COLUMN public.clients.number IS 'Número da residência do cliente (opcional)';
COMMENT ON COLUMN public.clients.neighborhood IS 'Bairro do cliente (opcional)';
COMMENT ON COLUMN public.clients.city IS 'Cidade do cliente (opcional)';
COMMENT ON COLUMN public.clients.state IS 'Estado do cliente (opcional)';
