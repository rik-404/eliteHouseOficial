# Configuração do Storage no Supabase

Este documento explica como configurar o Storage no Supabase para o Elite House Hub.

## Criação do Bucket

Para que o sistema de upload de documentos funcione corretamente, é necessário criar um bucket chamado `documents` no Supabase:

1. Acesse o painel do Supabase em https://app.supabase.com
2. Selecione o projeto `mlqpulpvjalkthbppipp`
3. No menu lateral, clique em "Storage"
4. Clique no botão "Criar novo bucket"
5. Digite o nome `documents` (exatamente como escrito, em minúsculas)
6. Desmarque a opção "Público" se quiser que os arquivos sejam privados
7. Clique em "Criar bucket"

## Configuração de Políticas de Segurança (RLS)

Para garantir que apenas usuários autenticados possam fazer upload de arquivos, configure as políticas de segurança:

1. No painel do Supabase, vá para "Storage" > "Políticas"
2. Clique no bucket `documents`
3. Adicione as seguintes políticas:

### Para a tabela de buckets:

```sql
CREATE POLICY "Permitir leitura de buckets públicos"
  ON storage.buckets FOR SELECT
  USING (name = 'documents');
```

### Para a tabela de objetos:

```sql
-- Permitir upload de arquivos para usuários autenticados
CREATE POLICY "Permitir upload de arquivos autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Permitir leitura de arquivos para usuários autenticados
CREATE POLICY "Permitir leitura de arquivos autenticados"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Permitir atualização de arquivos próprios
CREATE POLICY "Permitir atualização de arquivos próprios"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());

-- Permitir exclusão de arquivos próprios
CREATE POLICY "Permitir exclusão de arquivos próprios"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());
```

## Verificação

Após configurar o bucket e as políticas, teste o upload de documentos no sistema para garantir que tudo esteja funcionando corretamente.

Se encontrar algum erro relacionado a permissões, verifique as políticas de segurança no painel do Supabase.
