import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';

export const setupStorage = async () => {
  try {
    console.log('Verificando configuração do bucket de armazenamento...');
    
    // Tenta listar os buckets para verificar a conexão
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.warn('Erro ao listar buckets. Verificando se o bucket está acessível...', bucketsError);
      } else {
        const publicBucket = buckets?.find(bucket => bucket.name === 'publico');
        if (publicBucket) {
          console.log('Bucket "publico" encontrado:', publicBucket);
        } else {
          console.warn('Bucket "publico" não encontrado na listagem de buckets.');
        }
      }
    } catch (error) {
      console.warn('Erro ao tentar listar buckets:', error);
    }
    
    // Tenta verificar se o bucket está acessível
    try {
      console.log('Verificando acessibilidade do bucket "publico"...');
      
      // Tenta listar os arquivos no bucket (máximo 1 para verificar acessibilidade)
      const { data: files, error: listError } = await supabase.storage
        .from('publico')
        .list('', { limit: 1 });
      
      if (listError) {
        if (listError.message.includes('bucket')) {
          console.warn('❌ O bucket "publico" não existe ou não está acessível.');
          console.warn('Por favor, crie manualmente o bucket "publico" no painel do Supabase com as seguintes configurações:');
          console.warn('1. Acesse o painel do Supabase');
          console.warn('2. Vá para "Storage" > "Policies"');
          console.warn('3. Crie um novo bucket chamado "publico" com as seguintes configurações:');
          console.warn('   - Nome: publico');
          console.warn('   - Visibilidade: Público');
          console.warn('   - Tamanho máximo do arquivo: 50MB');
          console.warn('   - Tipos de mídia permitidos: image/*, video/*, application/pdf');
          console.warn('4. Após criar o bucket, clique em "Policies" e adicione uma política para permitir acesso público.');
        } else {
          console.warn('Erro ao acessar o bucket "publico":', listError);
        }
      } else {
        console.log('✅ Bucket "publico" está acessível!');
        if (files && files.length > 0) {
          console.log(`   - Total de arquivos encontrados: ${files.length}`);
        } else {
          console.log('   - O bucket está vazio.');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar acessibilidade do bucket:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Erro na configuração do armazenamento:', error);
    
    toast({
      title: "Erro de configuração",
      description: "Não foi possível configurar o armazenamento de mídias. Verifique o console para mais detalhes.",
      variant: "destructive"
    });
    
    return false;
  }
};

// Executa a configuração quando o módulo for importado
setupStorage().then(success => {
  if (success) {
    console.log('Configuração de armazenamento concluída com sucesso!');
  } else {
    console.error('Falha na configuração de armazenamento.');
  }
});
