-- Habilita o RLS no storage
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela de buckets
CREATE POLICY "Permitir leitura de buckets públicos"
  ON storage.buckets FOR SELECT
  USING (name = 'documents');

-- Políticas para a tabela de objetos
CREATE POLICY "Permitir upload de arquivos autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Permitir leitura de arquivos autenticados"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Permitir atualização de arquivos próprios"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());

CREATE POLICY "Permitir exclusão de arquivos próprios"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());

-- Função para obter o ID do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Configura o owner dos arquivos para o usuário que os enviou
ALTER TABLE storage.objects
  ENABLE ROW LEVEL SECURITY;

-- Garante que o owner seja definido automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_file()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.owner = auth.uid();
  RETURN NEW;
END;
$$;

-- Cria o trigger para definir o owner automaticamente
DROP TRIGGER IF EXISTS on_file_created ON storage.objects;
CREATE TRIGGER on_file_created
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_file();

-- Adiciona comentários para documentação
COMMENT ON POLICY "Permitir leitura de buckets públicos" ON storage.buckets IS 'Permite que usuários autenticados vejam o bucket de documentos';
COMMENT ON POLICY "Permitir upload de arquivos autenticados" ON storage.objects IS 'Permite que usuários autenticados façam upload de arquivos para o bucket de documentos';
COMMENT ON POLICY "Permitir leitura de arquivos autenticados" ON storage.objects IS 'Permite que usuários autenticados vejam os arquivos do bucket de documentos';
COMMENT ON POLICY "Permitir atualização de arquivos próprios" ON storage.objects IS 'Permite que usuários autenticados atualizem apenas seus próprios arquivos';
COMMENT ON POLICY "Permitir exclusão de arquivos próprios" ON storage.objects IS 'Permite que usuários autenticados excluam apenas seus próprios arquivos';
