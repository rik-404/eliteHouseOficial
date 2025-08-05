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
    
    // Extrai a extensão do arquivo original
    const fileExt = file.name.split('.').pop();
    // Define o caminho baseado no tipo de arquivo (imagem ou vídeo)
    const fileType = file.type.startsWith('image/') ? 'images' : 
                    file.type.startsWith('video/') ? 'videos' : 'other';
    
    // Cria um caminho único para o arquivo
    const publicPath = `${fileType}/${timestamp}-${randomId}.${fileExt}`;
    
    // Configurar opções de upload
    // Obtém a extensão do arquivo para determinar o tipo MIME
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    let mimeType = file.type;
    
    // Mapeia extensões comuns para seus tipos MIME
    if (!mimeType || mimeType === 'application/octet-stream') {
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime'
      };
      
      if (fileExtension && mimeTypes[fileExtension]) {
        mimeType = mimeTypes[fileExtension];
      } else {
        mimeType = 'application/octet-stream';
      }
    }
    
    const publicOptions = {
      ...uploadOptions,
      upsert: true,
      cacheControl: '3600',
      // Permite que o arquivo seja acessado publicamente
      public: true,
      // Define o tipo de conteúdo correto
      contentType: mimeType
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
export const getPublicUrl = (filePath: string | undefined, bucket: string = 'publico'): string => {
  if (!filePath) return '';
  
  // Se já for uma URL completa, retorna direto
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Se for um caminho que começa com 'publico/', remove o prefixo
  if (filePath.startsWith('publico/')) {
    filePath = filePath.substring(8);
  }
  
  // Remove a barra inicial do caminho, se existir
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  
  // Obtém a URL base do Supabase do environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  
  // Se não tivermos a URL do Supabase, tenta usar o método padrão
  if (!supabaseUrl) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(cleanPath);
    
    return data?.publicUrl || '';
  }
  
  // Constrói a URL manualmente para garantir que seja acessível
  // Formato: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[filePath]
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
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
