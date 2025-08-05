import { supabase } from './supabase';

/**
 * Gera uma referência sequencial para imóveis no formato 000000000000001
 * @param lastReference A última referência utilizada (opcional)
 * @returns Uma nova referência sequencial
 */
export const generatePropertyReference = (lastReference?: string): string => {
  // Se não houver última referência, começa do 1
  if (!lastReference) {
    return '000000000000001';
  }

  // Remove zeros à esquerda e converte para número
  const lastNumber = parseInt(lastReference, 10) || 0;
  
  // Incrementa o número e formata com 15 dígitos preenchidos com zeros à esquerda
  const nextNumber = lastNumber + 1;
  return nextNumber.toString().padStart(15, '0');
};

/**
 * Obtém a última referência de imóvel do banco de dados
 * @returns A última referência utilizada ou null se não houver imóveis
 */
export const getLastPropertyReference = async (): Promise<string | null> => {
  const { data, error } = await supabase
    .from('properties')
    .select('reference')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Erro ao buscar última referência:', error);
    return null;
  }

  return data.reference;
};
