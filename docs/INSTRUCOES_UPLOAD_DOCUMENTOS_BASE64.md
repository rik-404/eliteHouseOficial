# Instruções para Upload de Documentos com Base64

## Versão 1.6.0

Este documento descreve como configurar o sistema para permitir o upload de documentos usando Base64, evitando problemas de RLS (Row Level Security) no Supabase Storage.

## Visão Geral

Em vez de usar o Supabase Storage para armazenar arquivos, esta nova abordagem armazena os documentos diretamente no banco de dados como strings Base64. Isso elimina completamente os problemas de RLS no Storage, permitindo que qualquer usuário faça upload de documentos sem restrições.

## Alterações no Banco de Dados

Para implementar esta solução, você precisa adicionar uma nova coluna à tabela `client_documents`:

```sql
ALTER TABLE client_documents ADD COLUMN file_content TEXT;
```

Esta coluna armazenará o conteúdo do arquivo em formato Base64.

## Como Funciona

1. Quando um usuário faz upload de um documento, o arquivo é convertido para Base64 no navegador
2. O conteúdo Base64 é enviado para o servidor e armazenado diretamente na tabela `client_documents`
3. Para download, o conteúdo Base64 é recuperado do banco de dados e convertido de volta para um arquivo

## Vantagens

- **Sem problemas de RLS**: Como os arquivos são armazenados diretamente no banco de dados, não há problemas de RLS do Supabase Storage
- **Simplificação**: Não é necessário criar buckets ou configurar políticas de RLS para o Storage
- **Segurança**: Os documentos são protegidos pelas mesmas políticas de RLS da tabela `client_documents`

## Desvantagens

- **Tamanho do Banco**: Arquivos grandes aumentarão significativamente o tamanho do banco de dados
- **Performance**: Consultas que retornam muitos documentos podem ser mais lentas devido ao tamanho dos dados

## Configuração

1. Execute o SQL acima para adicionar a coluna `file_content` à tabela `client_documents`
2. Certifique-se de que suas políticas de RLS para a tabela `client_documents` estejam configuradas corretamente

## Políticas de RLS Recomendadas

Para a tabela `client_documents`, recomendamos as seguintes políticas:

```sql
-- Permitir que usuários autenticados leiam documentos
CREATE POLICY "Usuários autenticados podem ler documentos" ON client_documents
FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados insiram documentos
CREATE POLICY "Usuários autenticados podem inserir documentos" ON client_documents
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem documentos
CREATE POLICY "Usuários autenticados podem atualizar documentos" ON client_documents
FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados excluam documentos
CREATE POLICY "Usuários autenticados podem excluir documentos" ON client_documents
FOR DELETE USING (auth.role() = 'authenticated');
```

## Migração de Documentos Existentes

Se você já tem documentos armazenados no Supabase Storage, pode migrá-los para o novo formato Base64 com o seguinte processo:

1. Baixe todos os documentos do Storage
2. Converta cada documento para Base64
3. Atualize a tabela `client_documents` com o conteúdo Base64
4. Verifique se todos os documentos foram migrados corretamente antes de excluir os arquivos do Storage

## Conclusão

Esta abordagem elimina completamente os problemas de RLS no Supabase Storage, permitindo que qualquer usuário faça upload de documentos sem restrições. É uma solução simples e eficaz para sistemas com requisitos moderados de armazenamento de arquivos.
