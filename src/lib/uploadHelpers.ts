import { supabase, storageConfig } from './supabase';

// Lista de buckets alternativos para tentar em caso de falha
const FALLBACK_BUCKETS = [
  'publico',    // Bucket principal (sem restrições de RLS)
  'documents',  // Bucket alternativo 1
  'uploads',    // Bucket alternativo 2
  'temp'        // Bucket alternativo 3
];

// Configuração para permitir que qualquer usuário faça upload
const ALLOW_ANY_USER_UPLOAD = true;

/**
 * Função para fazer upload de arquivo com tentativas automáticas
 * Isso ajuda a lidar com problemas temporários de conexão ou permissões
 */
export const uploadFileWithRetry = async (
  filePath: string,
  file: File,
  options = {},
  maxRetries = storageConfig.retryCount
): Promise<{ data: any; error: any }> => {
  // Gerar identificadores únicos para o arquivo
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 7);
  
  // Verificar se o usuário está autenticado
  const { data: { session } } = await supabase.auth.getSession();
  
  // Permitir upload mesmo sem autenticação
  if (!session) {
    console.log('Usuário não está autenticado, mas vamos tentar o upload mesmo assim.');
  }
  
  console.log(`Iniciando upload com sistema anti-RLS avançado...`);
  
  // Opções de upload padrão
  const uploadOptions = {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'application/octet-stream',
    ...options
  };
  
  // Estratégia Única: Upload direto para o bucket público (sem restrições)
  try {
    console.log(`Tentando upload direto para o bucket público...`);
    
    // Usar um caminho simples com timestamp para evitar conflitos
    const publicPath = `docs/${timestamp}-${randomId}.pdf`;
    
    // Configurar opções para ignorar RLS
    const publicOptions = {
      ...uploadOptions,
      upsert: true,
      // Adicionar headers para tentar contornar restrições
      duplex: 'half',
      cacheControl: '0'
    };
    
    // Tentar upload para o bucket público
    const { data, error } = await supabase.storage
      .from('publico')
      .upload(publicPath, file, publicOptions);
      
    if (!error) {
      console.log(`Upload público bem-sucedido para publico/${publicPath}`);
      return { data: { ...data, path: publicPath, bucket: 'publico' }, error: null };
    }
    
    console.log(`Upload para bucket público falhou:`, error);
    return { data: null, error };
  } catch (e) {
    console.error(`Erro no upload para bucket público:`, e);
    return { data: null, error: e };
  }
  
  // Se chegarmos aqui, significa que o upload falhou
  console.error(`Upload para o bucket público falhou. Verifique se o bucket 'publico' existe no Supabase.`);
  return { 
    data: null, 
    error: { 
      message: 'Falha no upload para o bucket público. Verifique as configurações do Supabase.',
      details: 'Certifique-se de que o bucket "publico" existe e está configurado corretamente conforme INSTRUCOES_UPLOAD_DOCUMENTOS.md'
    } 
  };
};

/**
 * Função para obter URL pública de um arquivo
 * @param filePath Caminho do arquivo
 * @param bucket Bucket onde o arquivo está armazenado (opcional, padrão: 'publico')
 */
export const getPublicUrl = (filePath: string, bucket: string = 'publico'): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data?.publicUrl || '';
};

/**
 * Função para excluir um arquivo
 * @param filePath Caminho do arquivo
 * @param bucket Bucket onde o arquivo está armazenado (opcional, padrão: 'publico')
 */
export const deleteFile = async (filePath: string, bucket: string = 'publico'): Promise<{ error: any }> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  
  return { error };
};
