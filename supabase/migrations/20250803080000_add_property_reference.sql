-- Adiciona a coluna reference na tabela properties se não existir
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS reference VARCHAR(15) UNIQUE;

-- Cria uma sequência para gerar os números de referência
CREATE SEQUENCE IF NOT EXISTS property_reference_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Atualiza as referências existentes para usar o formato 000000000000001
-- Se não houver referência, usa o ID do imóvel como base
UPDATE properties 
SET reference = LPAD(COALESCE(
    NULLIF(CAST(reference AS INTEGER)::TEXT, ''), 
    id::TEXT
), 15, '0')
WHERE reference IS NULL OR reference = '';

-- Cria uma função para gerar a próxima referência
CREATE OR REPLACE FUNCTION generate_property_reference()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não houver referência fornecida, gera uma nova
    IF NEW.reference IS NULL OR NEW.reference = '' THEN
        NEW.reference := LPAD(NEXTVAL('property_reference_seq')::TEXT, 15, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o trigger para gerar a referência automaticamente
DROP TRIGGER IF EXISTS property_reference_trigger ON properties;
CREATE TRIGGER property_reference_trigger
BEFORE INSERT ON properties
FOR EACH ROW
EXECUTE FUNCTION generate_property_reference();
