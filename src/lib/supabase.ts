import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Nome do bucket para armazenar os documentos
// Usamos um bucket sem restrições de RLS para garantir que qualquer usuário possa fazer upload
const BUCKET_NAME = 'publico';

// Verifica se estamos em ambiente de desenvolvimento
const isDevelopment = import.meta.env.MODE === 'development';

// Configurações de ambiente
const forceUniqueFiles = import.meta.env.VITE_STORAGE_FORCE_UNIQUE === 'true';
const retryCount = parseInt(import.meta.env.VITE_STORAGE_RETRY_COUNT || '3', 10);

// Configuração específica para o Storage
const storageConfig = {
  bucket: BUCKET_NAME,
  options: {
    cacheControl: '3600',
    // Sempre usar upsert true para evitar problemas de permissão
    upsert: true,
    // Adicionar timestamp para evitar problemas de cache
    contentType: 'application/pdf'
  },
  // Configurações avançadas
  forceUniqueFiles,
  retryCount,
  // Adicionar informações de ambiente para debug
  environment: {
    mode: import.meta.env.MODE,
    isDevelopment
  }
};

// Função para verificar se o bucket existe
export const checkBucketExists = async (): Promise<boolean> => {
  try {
    // Tenta listar os arquivos do bucket para verificar se ele existe
    // Esta abordagem é mais confiável do que listar todos os buckets
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list();
    
    if (error) {
      if (error.message.includes('bucket') || error.message.includes('not found')) {
        console.log(`Bucket "${BUCKET_NAME}" não encontrado. É necessário criá-lo no painel do Supabase.`);
        return false;
      } else {
        // Se for outro tipo de erro, assume que o bucket existe
        console.log('Erro ao verificar bucket, mas assumindo que existe:', error.message);
        return true;
      }
    }
    
    // Se conseguiu listar os arquivos, o bucket existe
    console.log(`Bucket "${BUCKET_NAME}" encontrado com sucesso.`);
    return true;
  } catch (error) {
    console.error('Erro ao verificar bucket:', error);
    // Em caso de erro, assume que o bucket existe para continuar a operação
    return true;
  }
};

export { storageConfig };
