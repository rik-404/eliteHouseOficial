# Instruções para Upload de Documentos

Este documento explica como o sistema de upload de documentos funciona no ImobiFlow versão 1.5.9 e como configurar para que qualquer usuário possa fazer upload.

## Sistema Anti-RLS Avançado

O ImobiFlow versão 1.5.8 inclui um sistema avançado para lidar com problemas de permissões no Supabase Storage. Este sistema:

1. Tenta múltiplos caminhos de upload em caso de falha
2. Detecta erros de permissão (RLS) e usa estratégias alternativas
3. Tenta diferentes buckets de armazenamento quando necessário
4. Garante nomes de arquivos únicos com timestamp
5. Implementa mecanismos de recuperação automática

## Configuração Recomendada no Supabase

### 1. Criar o Bucket Público

Para permitir que qualquer usuário faça upload de documentos, é essencial criar um bucket público sem restrições de RLS:

1. Acesse o painel do Supabase em https://app.supabase.com
2. Selecione o projeto `mlqpulpvjalkthbppipp`
3. No menu lateral, clique em "Storage"
4. Clique em "Novo Bucket" e crie um bucket chamado `publico`
5. **IMPORTANTE:** Marque a opção "Bucket público" ao criar o bucket

### 2. Criar Buckets Adicionais (Opcional)

O sistema também pode usar outros buckets como alternativa. Se desejar, crie estes buckets adicionais:

- `documents` (principal)
- `uploads` (alternativo 1)
- `temp` (alternativo 2)

### 3. Configurar Políticas de RLS

#### Configurar o Bucket Público (Recomendado)

Para o bucket `publico`, configure as seguintes políticas para permitir acesso sem restrições:

```sql
-- Permitir upload de arquivos para QUALQUER USUÁRIO (mesmo sem autenticação)
CREATE POLICY "Permitir upload público"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'publico');

-- Permitir leitura de arquivos para QUALQUER USUÁRIO
CREATE POLICY "Permitir leitura pública"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'publico');

-- Permitir atualização de arquivos para QUALQUER USUÁRIO
CREATE POLICY "Permitir atualização pública"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'publico');

-- Permitir exclusão de arquivos para QUALQUER USUÁRIO
CREATE POLICY "Permitir exclusão pública"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'publico');
```

#### Desativar RLS para o Bucket Público (Solução mais simples)

A forma mais simples de permitir que qualquer usuário faça upload é desativar completamente o RLS para o bucket `publico`:

1. Acesse o painel do Supabase
2. Vá para Storage > Buckets
3. Selecione o bucket `publico`
4. Clique na aba "Políticas"
5. Desative a opção "Habilitar RLS" (ou "Enable RLS")
6. Clique em "Salvar"

Isso permitirá que qualquer usuário faça upload sem restrições.

## Variáveis de Ambiente

O sistema usa as seguintes variáveis de ambiente para controlar o comportamento do upload:

```
VITE_STORAGE_FORCE_UNIQUE=true
VITE_STORAGE_RETRY_COUNT=3
```

## Solução de Problemas

### Erro "violates row-level security policy"

Se você estiver enfrentando o erro "new row violates row-level security policy", siga estas etapas:

1. Verifique se todos os buckets foram criados conforme instruções acima
2. Aplique as políticas de RLS em **TODOS** os buckets
3. Certifique-se de que o usuário está autenticado antes de tentar o upload

### Erro 400 (Bad Request)

Se estiver recebendo erro 400 durante o upload:

1. Verifique se o arquivo é um PDF válido
2. Certifique-se de que o arquivo não excede 5MB
3. Tente fazer upload de um arquivo menor para teste
4. Verifique se o bucket existe e está corretamente configurado

### Erros gerais de upload

Para outros problemas com upload de documentos:

1. Limpe o cache do navegador e tente novamente
2. Verifique se o usuário tem permissões de administrador no sistema
3. Verifique os logs no console do navegador para identificar o erro específico
4. Tente usar um nome de arquivo mais simples (sem caracteres especiais)
5. Tente fazer upload em outro navegador

### Solução de último recurso

Se nenhuma das soluções acima funcionar:

1. Desative temporariamente o RLS para o bucket `public` no Supabase
2. Faça o upload para este bucket sem RLS
3. Reative o RLS após concluir os uploads necessários

## Contato para Suporte

Se precisar de ajuda adicional, entre em contato com o suporte técnico da Vendramini Informática.
