import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey
    }
  }
});

// Nome do bucket para armazenar os documentos
// Usamos o nome correto do bucket
const BUCKET_NAME = 'documents';

// Configuração específica para o Storage
const storageConfig = {
  bucket: BUCKET_NAME,
  options: {
    cacheControl: '3600',
    upsert: false
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
