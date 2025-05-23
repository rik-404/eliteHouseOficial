import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientDocument, DocumentType } from '@/types/client-document';
import { supabase, storageConfig, checkBucketExists } from '@/lib/supabase';
import { Trash2, Download, Upload, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Definir os tipos de documento exatamente como estão no banco de dados
// Importante: os valores devem corresponder exatamente aos valores aceitos pelo enum no banco de dados
const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'CERTIDAO_ESTADO_CIVIL', label: 'Certidão de Estado Civil' },
  { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência' },
  { value: 'CARTEIRA_TRABALHO', label: 'Carteira de Trabalho' },
  { value: 'EXTRATO_BANCARIO', label: 'Extrato Bancário' },
  { value: 'EXTRATO_FGTS', label: 'Extrato FGTS' },
  { value: 'SIMULACAO', label: 'Simulação' },
  { value: 'FICHA_CAIXA', label: 'Ficha Caixa' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'IDENTIFICACAO', label: 'Identificação' },
  { value: 'COMPROVANTE_RENDA', label: 'Comprovante de Renda' },
  { value: 'OUTROS', label: 'Outros' },
];

interface ClientDocumentsProps {
  clientId: string;
}

export const ClientDocuments: React.FC<ClientDocumentsProps> = ({ clientId }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('OUTROS');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchDocuments();
    
    // Configurar escuta em tempo real para documentos de clientes
    const channel = supabase
      .channel('client-documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_documents',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          console.log('Mudança detectada nos documentos do cliente:', payload);
          fetchDocuments(); // Atualiza a lista de documentos automaticamente
        }
      )
      .subscribe();

    // Limpar a escuta quando o componente for desmontado
    return () => {
      channel.unsubscribe();
    };
  }, [clientId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }
    
    if (!clientId) {
      toast.error('ID do cliente não encontrado');
      return;
    }

    try {
      setUploading(true);
      
      // Verificar se o arquivo é válido - apenas PDF permitido
      const validTypes = ['application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        throw new Error('Apenas arquivos PDF são permitidos. Por favor, selecione um arquivo PDF.');
      }
      
      // Verificar a extensão do arquivo para garantir que é PDF
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'pdf') {
        throw new Error('Apenas arquivos com extensão .pdf são permitidos.');
      }
      
      // Criar caminho único para o arquivo
      const fileName = `${clientId}/${Date.now()}`;
      const filePath = `client-documents/${fileName}`;
      
      console.log('Iniciando upload do arquivo:', filePath);
      
      // 1. Verificar se o usuário está autenticado
      if (!user) {
        console.error('Usuário não autenticado');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }
      
      console.log('Usuário autenticado:', user.id);
      
      // 2. Verificar se o bucket existe
      console.log('Verificando bucket de armazenamento...');
      const bucketExists = await checkBucketExists();
      
      if (!bucketExists) {
        throw new Error(`O bucket de armazenamento não existe. Por favor, crie o bucket "${storageConfig.bucket}" no painel do Supabase.`);
      }
      
      // 3. Fazer upload real para o Supabase Storage
      console.log('Iniciando upload real para o Supabase Storage');
      
      // Gerar um nome de arquivo único baseado no timestamp e nome original
      // Já sabemos que é um PDF pela validação anterior
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.pdf`;
      
      // Caminho completo do arquivo no Storage
      // Removendo o prefixo 'client-documents/' para evitar erro 400
      const storagePath = `${clientId}/${uniqueFileName}`;
      
      // Fazer o upload real para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(storageConfig.bucket)
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      console.log('Resultado do upload:', uploadData, uploadError);
      
      if (uploadError) {
        console.error('Erro no upload do arquivo:', uploadError);
        try {
          // Tenta converter o erro para string JSON apenas se for um objeto válido
          if (uploadError && typeof uploadError === 'object') {
            console.error('Detalhes do erro:', JSON.stringify(uploadError, null, 2));
          } else {
            console.error('Detalhes do erro (não é um objeto JSON válido):', uploadError);
          }
        } catch (jsonError) {
          console.error('Erro ao converter detalhes para JSON:', uploadError);
        }
        console.error('Caminho tentado:', storagePath);
        console.error('Bucket usado:', storageConfig.bucket);
        
        toast.error(`Erro no upload: ${uploadError.message || 'Erro desconhecido'}`, { duration: 5000 });
        
        // Tentar novamente com um caminho ainda mais simples
        console.log('Tentando upload com caminho alternativo...');
        
        // Garantir que estamos usando um tipo de documento válido
        const docType = documentType || 'OUTROS';
        
        const alternativePath = `docs/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.pdf`;
        
        const { data: retryData, error: retryError } = await supabase.storage
          .from(storageConfig.bucket)
          .upload(alternativePath, selectedFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (retryError) {
          console.error('Falha na segunda tentativa:', retryError);
          throw uploadError; // Lançar o erro original para manter a consistência
        } else {
          console.log('Segunda tentativa bem-sucedida:', retryData);
          
          // Obter a URL pública do arquivo no caminho alternativo
          const { data: altUrlData } = await supabase.storage
            .from(storageConfig.bucket)
            .getPublicUrl(alternativePath);
          
          // Salvar metadados com o novo caminho
          const { data: docData, error: docError } = await supabase
            .from('client_documents')
            .insert([{
              client_id: clientId,
              document_type: docType,
              file_name: selectedFile.name,
              file_url: altUrlData.publicUrl,
              file_path: alternativePath,
              file_size: selectedFile.size,
              file_type: selectedFile.type,
              description: description || null,
            }])
            .select();
          
          if (docError) {
            console.error('Erro ao salvar metadados com caminho alternativo:', docError);
            throw docError;
          }
          
          toast.success('Documento enviado com sucesso!');
          setSelectedFile(null);
          setDescription('');
          setDocumentType('OUTROS');
          setUploading(false);
          return;
        }
      }

      if (!uploadData) {
        console.error('Nenhum dado retornado do upload');
        throw new Error('Falha no upload: nenhum dado retornado');
      }
      
      console.log('Upload concluído com sucesso:', uploadData);

      console.log('Upload concluído, obtendo URL pública...');
      
      // Obter a URL pública do arquivo no Supabase Storage
      const { data: urlData } = await supabase.storage
        .from(storageConfig.bucket)
        .getPublicUrl(storagePath);

      console.log('Salvando metadados no banco de dados...');
      
      // Verificar o tipo de documento antes de salvar
      console.log('Tipo de documento a ser salvo:', documentType);
      
      // Garantir que o tipo de documento seja válido
      // Converter para minúsculas para evitar problemas de case-sensitivity
      let safeDocumentType = documentType;
      
      // Verificar se o tipo está na lista de tipos válidos
      const isValidType = DOCUMENT_TYPES.some(type => type.value === documentType);
      
      // Se não for válido, usar 'OUTROS'
      if (!isValidType) {
        console.warn(`Tipo de documento inválido: ${documentType}. Usando 'OUTROS' como fallback.`);
        safeDocumentType = 'OUTROS';
      }
      
      console.log('Tipo original:', documentType);
      console.log('Tipo seguro a ser usado:', safeDocumentType);
      
      // Preparar dados para inserção
      const documentData = {
        client_id: clientId,
        document_type: safeDocumentType,
        file_name: selectedFile.name,
        file_url: urlData.publicUrl, // URL pública do Supabase
        file_path: storagePath, // Caminho real no Supabase Storage
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        description: description || null,
      };
      
      console.log('Dados do documento a serem inseridos:', documentData);
      
      // 3. Salvar metadados no banco de dados
      const { data, error: dbError } = await supabase
        .from('client_documents')
        .insert([documentData])
        .select();

      if (dbError) {
        console.error('Erro ao salvar metadados:', dbError);
        console.error('Detalhes do erro:', JSON.stringify(dbError, null, 2));
        
        // Verificar se o erro está relacionado ao tipo de documento
        if (dbError.message && dbError.message.includes('document_type')) {
          toast.error(`Erro no tipo de documento: ${dbError.message}`);
          console.error('Erro no tipo de documento. Tentando novamente com tipo "OUTROS"...');
          
          // Tentar novamente com o tipo OUTROS
          const fallbackData = {
            ...documentData,
            document_type: 'OUTROS'
          };
          
          console.log('Tentando novamente com:', fallbackData);
          
          const { data: retryData, error: retryError } = await supabase
            .from('client_documents')
            .insert([fallbackData])
            .select();
            
          if (retryError) {
            console.error('Falha na segunda tentativa:', retryError);
            toast.error(`Falha ao salvar documento: ${retryError.message}`);
          } else {
            console.log('Segunda tentativa bem-sucedida:', retryData);
            toast.success('Documento enviado com sucesso!');
            setSelectedFile(null);
            setDescription('');
            setDocumentType('OUTROS');
            return;
          }
        } else {
          toast.error(`Falha ao salvar metadados: ${dbError.message || 'Erro desconhecido'}`);
        }
        
        throw new Error(`Falha ao salvar metadados: ${dbError.message}`);
      }

      console.log('Documento salvo com sucesso:', data);
      toast.success('Documento enviado com sucesso!');
      
      // Limpar formulário e atualizar lista
      setSelectedFile(null);
      setDescription('');
      fetchDocuments();
      
    } catch (error) {
      console.error('Erro detalhado ao enviar documento:', error);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro ao enviar documento';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Verifique o console para mais detalhes.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, filePath: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      // Excluir do storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Excluir do banco de dados
      const { error: dbError } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Documento excluído com sucesso!');
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const handleDownloadAllDocuments = async () => {
    try {
      setDownloading(true);
      toast.info('Preparando arquivos para download...');
      
      // Criar um novo objeto ZIP
      const zip = new JSZip();
      
      // Contador para acompanhar o progresso
      let processedCount = 0;
      const totalDocuments = documents.length;
      
      // Array para armazenar promessas de download
      const downloadPromises = documents.map(async (doc) => {
        try {
          // Verificar se o caminho é válido
          if (!doc.file_path || doc.file_path.startsWith('local://')) {
            console.warn('Caminho de arquivo inválido ou local:', doc.file_path);
            // Tentar usar a URL pública se disponível
            if (doc.file_url) {
              try {
                const response = await fetch(doc.file_url);
                if (response.ok) {
                  const blob = await response.blob();
                  // Adicionar o arquivo ao ZIP com um nome legível
                  const safeFileName = `${doc.document_type}_${doc.file_name}`;
                  zip.file(safeFileName, blob);
                }
              } catch (error) {
                console.error('Erro ao baixar arquivo da URL pública:', error);
              }
            }
          
          } else {
            // É um arquivo no Supabase Storage
            // Tentar baixar o arquivo do Supabase
            console.log('Tentando baixar arquivo:', doc.file_path);
            
            try {
              // Tentar baixar usando o caminho armazenado
              const { data, error } = await supabase.storage
                .from(storageConfig.bucket)
                .download(doc.file_path);
                
              if (error) {
                console.error('Erro ao baixar arquivo com caminho original:', doc.file_name, error);
                throw error; // Forçar a tentativa alternativa
              }
              
              if (data) {
                // Adicionar o arquivo ao ZIP com um nome legível
                const safeFileName = `${doc.document_type}_${doc.file_name}`;
                zip.file(safeFileName, data);
                return true;
              }
              return false;
            } catch (downloadError) {
              console.warn('Tentando caminho alternativo para download...');
              
              // Extrair o nome do arquivo do caminho ou da URL
              const fileName = doc.file_path.split('/').pop() || doc.file_name;
              
              // Tentar diferentes formatos de caminho
              const possiblePaths = [
                doc.file_path,
                `${clientId}/${fileName}`,
                `docs/${fileName}`,
                fileName
              ];
              
              // Tentar cada caminho possível
              for (const path of possiblePaths) {
                try {
                  console.log('Tentando caminho alternativo:', path);
                  const { data: altData, error } = await supabase.storage
                    .from(storageConfig.bucket)
                    .download(path);
                    
                  if (!error && altData) {
                    console.log('Download bem-sucedido com caminho alternativo:', path);
                    // Adicionar o arquivo ao ZIP com um nome legível
                    const safeFileName = `${doc.document_type}_${doc.file_name}`;
                    zip.file(safeFileName, altData);
                    return true;
                  }
                } catch (e) {
                  console.warn(`Falha no caminho ${path}:`, e);
                  // Continuar tentando outros caminhos
                }
              }
              
              // Se chegou aqui, todas as tentativas falharam
              console.error('Todas as tentativas de download falharam para:', doc.file_name);
              toast.error(`Não foi possível baixar: ${doc.file_name}`);
              return false;
            }
          }
        } catch (error) {
          console.error('Erro ao processar arquivo:', doc.file_name, error);
        } finally {
          // Incrementar o contador de progresso
          processedCount++;
          if (processedCount % 2 === 0 || processedCount === totalDocuments) {
            toast.info(`Processando arquivos: ${processedCount}/${totalDocuments}`);
          }
        }
      });
      
      // Aguardar todos os downloads terminarem
      await Promise.all(downloadPromises);
      
      // Gerar o arquivo ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Baixar o arquivo ZIP
      saveAs(zipBlob, `documentos_cliente_${clientId}_${new Date().toISOString().slice(0, 10)}.zip`);
      
      toast.success('Download de todos os documentos concluído!');
    } catch (error) {
      console.error('Erro ao baixar documentos:', error);
      toast.error('Erro ao preparar documentos para download. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Enviar Novo Documento</h3>
          {documents.length > 0 && (
            <Button
              onClick={handleDownloadAllDocuments}
              disabled={downloading}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <Archive className="h-4 w-4" />
              {downloading ? 'Preparando ZIP...' : 'Baixar Todos (ZIP)'}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Tipo de Documento</Label>
            <Select 
              value={documentType} 
              onValueChange={(value: DocumentType) => {
                console.log('Tipo de documento selecionado:', value);
                setDocumentType(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo (Apenas PDF)</Label>
            <Input 
              id="file" 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Input 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Contrato de compra e venda"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Enviando...' : 'Enviar Documento'}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Documentos do Cliente</h3>
        {loading ? (
          <div className="text-center py-4">Carregando documentos...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Nenhum documento encontrado</div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{getDocumentTypeLabel(doc.document_type)}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {doc.file_name} • {formatFileSize(doc.file_size)}
                  </div>
                  {doc.description && (
                    <div className="text-xs text-gray-500 mt-1">{doc.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Enviado em {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="Visualizar"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button 
                    onClick={() => handleDelete(doc.id, doc.file_path)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDocuments;
