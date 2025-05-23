# Instruções para o Status e Situação de Imóveis

Este documento explica como funciona o novo sistema de status e situação para imóveis e as alterações necessárias no banco de dados.

## Funcionalidade

O sistema agora permite controlar quais imóveis são exibidos no site através de duas opções:

### Status (Ativo/Inativo)

- **Imóveis Ativos (status = true)**: São exibidos no site (se não estiverem vendidos)
- **Imóveis Inativos (status = false)**: Não aparecem no site, mas continuam disponíveis no painel administrativo

### Situação (Disponível/Vendido)

- **Imóveis Disponíveis (vendido = false)**: São exibidos no site (se estiverem ativos)
- **Imóveis Vendidos (vendido = true)**: Não aparecem no site, mas continuam disponíveis no painel administrativo

## Alterações no Banco de Dados

Para implementar esta funcionalidade, é necessário adicionar duas colunas à tabela `properties` no Supabase.

### SQL para Adicionar as Colunas

Execute o seguinte comando SQL no Editor SQL do Supabase:

```sql
-- Adicionar coluna status com valor padrão true (ativo)
ALTER TABLE properties 
ADD COLUMN status BOOLEAN DEFAULT true;

-- Atualizar todos os registros existentes para status = true
UPDATE properties 
SET status = true 
WHERE status IS NULL;

-- Adicionar coluna vendido com valor padrão false (disponível)
ALTER TABLE properties 
ADD COLUMN vendido BOOLEAN DEFAULT false;

-- Atualizar todos os registros existentes para vendido = false
UPDATE properties 
SET vendido = false 
WHERE vendido IS NULL;
```

## Como Usar

### No Painel Administrativo

1. Ao editar um imóvel, você verá duas novas opções:
   - **Status**: Caixa de seleção "Ativo" - controla se o imóvel aparece no site
   - **Situação**: Caixa de seleção "Vendido" - marca o imóvel como vendido e o remove do site

2. Na lista de imóveis, você pode filtrar por:
   - **Status**: Todos, Ativos, Inativos
   - **Situação**: Todos, Disponíveis, Vendidos

3. O status e a situação de cada imóvel são indicados por badges coloridos na lista:
   - **Status**: Verde (Ativo) ou Vermelho (Inativo)
   - **Situação**: Azul (Disponível) ou Roxo (Vendido)

### No Site

- Apenas imóveis que atendam a AMBAS as condições serão exibidos no site:
  - Marcados como "Ativos" (status = true)
  - NÃO marcados como "Vendidos" (vendido = false)

- Estes imóveis aparecerão nas seguintes seções:
  - Página inicial (destaques)
  - Página de busca de imóveis
  - Filtros de localização e tipo
  
- Se um usuário tentar acessar diretamente a URL de um imóvel inativo ou vendido, ele será redirecionado para a página de imóveis com uma mensagem informativa específica para cada caso.

## Benefícios

- Permite remover temporariamente imóveis do site sem excluí-los do banco de dados
- Facilita o gerenciamento de imóveis que estão em negociação ou indisponíveis
- Mantém o histórico completo de imóveis no sistema, incluindo os já vendidos
- Possibilita análises de vendas e desempenho com base no histórico de imóveis vendidos

## Observações

- Todos os imóveis existentes serão marcados como "Ativos" e "Disponíveis" por padrão
- Apenas usuários com permissões administrativas podem alterar o status e a situação dos imóveis
- Um imóvel marcado como vendido é automaticamente removido do site, independentemente do seu status
