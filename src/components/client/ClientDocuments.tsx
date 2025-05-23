import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientDocument, DocumentType } from '@/types/client-document';
import { supabase } from '@/lib/supabase';
import { saveDocumentAsBase64, getDocumentBase64, deleteDocumentBase64 } from '@/lib/base64Helpers';
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

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ clientId }) => {
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
      
      console.log('Iniciando upload do arquivo com Base64...');
      
      // Garantir que o tipo de documento seja válido
      let safeDocumentType = documentType;
      
      // Verificar se o tipo está na lista de tipos válidos
      const isValidType = DOCUMENT_TYPES.some(type => type.value === documentType);
      
      // Se não for válido, usar 'OUTROS'
      if (!isValidType) {
        console.warn(`Tipo de documento inválido: ${documentType}. Usando 'OUTROS' como fallback.`);
        safeDocumentType = 'OUTROS';
      }
      
      // Usar a nova função de upload com Base64
      const { data: documentData, error: uploadError } = await saveDocumentAsBase64(
        clientId,
        selectedFile,
        safeDocumentType,
        description || 'Documento'
      );
      
      if (uploadError) {
        console.error('Erro no upload do arquivo:', uploadError);
        toast.error(`Erro no upload: ${uploadError.message || 'Erro desconhecido'}`, { duration: 5000 });
        setUploading(false);
        return;
      }
      
      if (!documentData) {
        console.error('Nenhum dado retornado do upload');
        toast.error('Falha no upload: nenhum dado retornado', { duration: 5000 });
        setUploading(false);
        return;
      }
      
      console.log('Upload concluído com sucesso:', documentData);
      
      toast.success('Documento enviado com sucesso!');
      setSelectedFile(null);
      setDescription('');
      setDocumentType('OUTROS');
      setUploading(false);
      
      // Atualizar a lista de documentos
      fetchDocuments();
    } catch (error: any) {
      console.error('Erro ao fazer upload do documento:', error);
      toast.error(`Erro: ${error.message || 'Erro desconhecido'}`);
      setUploading(false);
    }
  };

  const handleDownload = async (doc: ClientDocument) => {
    try {
      setDownloading(true);
      
      // Verificar se o documento tem um ID
      if (!doc.id) {
        throw new Error('ID do documento não encontrado');
      }
      
      console.log('Obtendo conteúdo Base64 do documento:', doc.id);
      
      // Obter o conteúdo Base64 do documento
      const base64Content = await getDocumentBase64(doc.id);
      
      if (!base64Content) {
        throw new Error('Não foi possível obter o conteúdo do documento');
      }
      
      console.log('Conteúdo Base64 obtido com sucesso');
      
      // Criar um link para download
      const linkSource = base64Content;
      const downloadLink = window.document.createElement("a");
      
      // Definir atributos do link
      downloadLink.href = linkSource;
      downloadLink.download = doc.file_name || 'documento.pdf';
      
      // Adicionar o link ao documento e clicar nele
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Remover o link do documento
      window.document.body.removeChild(downloadLink);
      
      toast.success('Download iniciado');
    } catch (error: any) {
      console.error('Erro ao baixar documento:', error);
      toast.error(`Erro no download: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (document: ClientDocument) => {
    if (!window.confirm(`Tem certeza que deseja excluir o documento "${document.file_name}"?`)) {
      return;
    }

    try {
      console.log('Excluindo documento:', document);
      
      // Excluir o documento do banco de dados
      const { error: dbError } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', document.id);
      
      if (dbError) {
        throw dbError;
      }
      
      // Se o documento tiver um caminho de arquivo, excluir o arquivo também
      if (document.file_path) {
        console.log('Excluindo arquivo:', document.file_path);
        
        // Usar a nova função de exclusão com Base64
        const { error: deleteError } = await deleteDocumentBase64(document.id);
        
        if (deleteError) {
          console.error('Erro ao excluir arquivo:', deleteError);
          // Não lançar erro aqui, pois o documento já foi excluído do banco
        }
      }
      
      toast.success('Documento excluído com sucesso');
      
      // Atualizar a lista de documentos
      fetchDocuments();
    } catch (error: any) {
      console.error('Erro ao excluir documento:', error);
      toast.error(`Erro ao excluir: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleDownloadAll = async () => {
    if (documents.length === 0) {
      toast.error('Não há documentos para baixar');
      return;
    }

    try {
      setDownloading(true);
      
      const zip = new JSZip();
      let successCount = 0;
      let errorCount = 0;
      
      // Criar pastas por tipo de documento
      const foldersByType: Record<string, JSZip> = {};
      
      for (const docType of DOCUMENT_TYPES) {
        foldersByType[docType.value] = zip.folder(docType.label) as JSZip;
      }
      
      // Adicionar documentos às pastas correspondentes
      for (const doc of documents) {
        try {
          // Obter o conteúdo Base64 do documento
          const base64Content = await getDocumentBase64(doc.id);
          
          if (!base64Content) {
            console.error('Não foi possível obter o conteúdo do documento:', doc.id);
            errorCount++;
            continue;
          }
          
          // Remover o prefixo "data:application/pdf;base64," do conteúdo Base64
          const base64Data = base64Content.replace(/^data:application\/pdf;base64,/, '');
          
          // Determinar a pasta correta com base no tipo de documento
          const folder = foldersByType[doc.document_type] || foldersByType['OUTROS'];
          
          // Adicionar o documento à pasta
          folder.file(doc.file_name || `documento_${doc.id}.pdf`, base64Data, { base64: true });
          
          successCount++;
        } catch (docError) {
          console.error('Erro ao processar documento para ZIP:', docError);
          errorCount++;
        }
      }
      
      // Gerar o arquivo ZIP
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      // Fazer o download do arquivo ZIP
      saveAs(zipContent, `documentos_cliente_${clientId}.zip`);
      
      if (errorCount > 0) {
        toast.warning(`Download concluído com ${errorCount} erros. ${successCount} documentos foram baixados com sucesso.`);
      } else {
        toast.success(`${successCount} documentos baixados com sucesso`);
      }
    } catch (error: any) {
      console.error('Erro ao baixar todos os documentos:', error);
      toast.error(`Erro: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documentos</h2>
        <Button 
          variant="outline" 
          onClick={handleDownloadAll}
          disabled={downloading || documents.length === 0}
        >
          {downloading ? 'Baixando...' : 'Baixar Todos'}
          <Archive className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid gap-4 border p-4 rounded-md">
        <h3 className="text-lg font-semibold">Enviar Novo Documento</h3>
        
        <div className="grid gap-2">
          <Label htmlFor="documentType">Tipo de Documento</Label>
          <Select
            value={documentType}
            onValueChange={(value) => setDocumentType(value as DocumentType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de documento" />
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
        
        <div className="grid gap-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do documento"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="file">Arquivo (PDF)</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500">Apenas arquivos PDF são aceitos</p>
        </div>
        
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? 'Enviando...' : 'Enviar Documento'}
          <Upload className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Documentos Enviados</h3>
        
        {loading ? (
          <div className="text-center py-4">Carregando documentos...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Nenhum documento encontrado</div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border p-4 rounded-md flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{doc.file_name}</h4>
                  <p className="text-sm text-gray-500">
                    {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || 'Outro'}
                    {doc.description && ` - ${doc.description}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    disabled={downloading}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(doc)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
