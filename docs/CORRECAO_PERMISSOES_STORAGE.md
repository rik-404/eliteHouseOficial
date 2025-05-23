# Correção de Permissões no Storage do Supabase

Este documento explica como corrigir o erro de permissão que está impedindo o upload de documentos no Supabase.

## Problema Identificado

O erro `new row violates row-level security policy` indica que as políticas de segurança (RLS) configuradas no Supabase estão impedindo o upload de arquivos.

## Solução

Para resolver este problema, siga os passos abaixo para atualizar as políticas de segurança do bucket `documents`:

1. Acesse o painel do Supabase em https://app.supabase.com
2. Selecione o projeto `mlqpulpvjalkthbppipp`
3. No menu lateral, clique em "Storage"
4. Clique na aba "Políticas"
5. Selecione o bucket `documents`

### Políticas Atualizadas para a Tabela de Objetos

Substitua as políticas existentes pelas seguintes:

```sql
-- Permitir upload de arquivos para TODOS os usuários autenticados (sem restrições adicionais)
CREATE POLICY "Permitir upload sem restrições"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Permitir leitura de arquivos para TODOS os usuários autenticados
CREATE POLICY "Permitir leitura para todos autenticados"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

-- Permitir atualização de arquivos para TODOS os usuários autenticados
CREATE POLICY "Permitir atualização para todos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents');

-- Permitir exclusão de arquivos para TODOS os usuários autenticados
CREATE POLICY "Permitir exclusão para todos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');
```

## Explicação

As políticas originais estavam restringindo algumas operações apenas para o proprietário do arquivo (`owner = auth.uid()`). No entanto, isso pode causar problemas quando:

1. O usuário que faz upload não é o mesmo que criou o bucket
2. Diferentes usuários precisam acessar os mesmos arquivos
3. O sistema usa um único usuário de serviço para operações de backend

As novas políticas permitem que qualquer usuário autenticado realize todas as operações no bucket `documents`, o que é mais adequado para um sistema compartilhado como o Elite House Hub.

## Verificação

Após atualizar as políticas, teste novamente o upload de documentos no sistema. O erro de permissão deve ser resolvido.

Se ainda encontrar problemas, verifique:
- Se o usuário está autenticado corretamente
- Se o bucket `documents` existe
- Se há outras restrições no nível do banco de dados
