-- Adiciona a coluna broker_id na tabela properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES users(id) ON DELETE SET NULL;
