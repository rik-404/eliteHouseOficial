import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon, Video, Trash2, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadFileWithRetry, getPublicUrl } from '@/lib/uploadHelpers';
import { Input } from '@/components/ui/input';

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'youtube';
  file?: File;
  isNew?: boolean;
  thumbnail?: string;
}

interface MediaManagerProps {
  initialMedias?: Array<{ url: string; type: 'image' | 'video' | 'youtube' }>;
  mainImageUrl?: string;
  onChange: (medias: MediaItem[], mainImageUrl: string) => void;
  maxFiles?: number;
}

const MediaManager: React.FC<MediaManagerProps> = ({
  initialMedias = [],
  mainImageUrl = '',
  onChange,
  maxFiles = 15,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [currentMainImage, setCurrentMainImage] = useState(mainImageUrl);

  // Inicializa as mídias
  useEffect(() => {
    if (initialMedias && initialMedias.length > 0) {
      setMedias(
        initialMedias.map((media) => ({
          url: media.url,
          type: media.type,
          isNew: false,
        }))
      );
    }
  }, [initialMedias]);

  // Notifica as alterações
  useEffect(() => {
    onChange(medias, currentMainImage);
  }, [medias, currentMainImage, onChange]);

  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    
    console.log('Extraindo ID da URL:', url);
    
    // Remove espaços em branco e parâmetros adicionais
    const cleanUrl = url.trim().split('&')[0];
    
    // Padrões para extrair o ID do vídeo de diferentes formatos de URL
    const patterns = [
      // Formato: https://www.youtube.com/watch?v=ID
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^#&?\/]+)/,
      // Formato: https://youtu.be/ID
      /youtu\.be\/([^#&?\/]+)/,
      // Formato: ID (apenas o ID)
      /^([a-zA-Z0-9_-]{11})$/,
      // Formato: https://www.youtube.com/embed/ID
      /youtube\.com\/embed\/([^#&?\/]+)/,
      // Formato: https://www.youtube.com/shorts/ID
      /youtube\.com\/shorts\/([^#&?\/]+)/
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        console.log('ID do YouTube extraído:', videoId);
        return videoId;
      }
    }
    
    console.error('Não foi possível extrair o ID do YouTube da URL:', url);
    return null;
  };

  const addYoutubeVideo = (url: string) => {
    console.log('[DEBUG] Iniciando addYoutubeVideo com URL:', url);
    
    try {
      if (!url || typeof url !== 'string') {
        const errorMsg = 'URL inválida ou não fornecida';
        console.error('[DEBUG]', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('[DEBUG] Extraindo ID do vídeo...');
      const videoId = extractYoutubeId(url);
      
      if (!videoId) {
        const errorMsg = `Não foi possível extrair o ID do vídeo da URL: ${url}`;
        console.error('[DEBUG]', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('[DEBUG] ID do vídeo extraído:', videoId);
      
      // Verifica se o ID tem o comprimento correto
      if (videoId.length !== 11) {
        const errorMsg = `ID do vídeo inválido: "${videoId}" (comprimento: ${videoId.length}, esperado: 11)`;
        console.error('[DEBUG]', errorMsg);
        throw new Error(errorMsg);
      }

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      console.log('[DEBUG] Thumbnail URL:', thumbnailUrl);
      console.log('[DEBUG] Embed URL:', embedUrl);
      
      const newMedia: MediaItem = {
        url: embedUrl,
        type: 'youtube',
        thumbnail: thumbnailUrl,
        isNew: true
      };

      console.log('[DEBUG] Nova mídia a ser adicionada:', newMedia);
      
      setMedias(prev => {
        // Separa as mídias atuais em imagens e vídeos
        const currentImages = prev.filter(m => m.type !== 'youtube');
        const currentVideos = prev.filter(m => m.type === 'youtube');
        
        // Adiciona o novo vídeo à lista de vídeos
        const updatedVideos = [...currentVideos, newMedia];
        
        // Combina as imagens primeiro e depois os vídeos
        const updatedMedias = [...currentImages, ...updatedVideos];
        
        // Se for a primeira mídia e não houver imagem principal, define como principal
        if (updatedMedias.length === 1 && !currentMainImage) {
          console.log('Definindo como mídia principal:', thumbnailUrl);
          setCurrentMainImage(thumbnailUrl);
        } else if (currentMainImage) {
          console.log('Mantendo a mídia principal existente');
        } else if (updatedMedias.length > 0) {
          // Se não houver mídia principal definida, define a primeira imagem como principal
          const firstImage = updatedMedias.find(m => m.type !== 'youtube');
          if (firstImage) {
            console.log('Definindo a primeira imagem como principal:', firstImage.thumbnail || firstImage.url);
            setCurrentMainImage(firstImage.thumbnail || firstImage.url);
          }
        }
        
        console.log('Mídias atualizadas (vídeos no final):', updatedMedias);
        return updatedMedias;
      });

      setYoutubeUrl('');
      console.log('Vídeo do YouTube adicionado com sucesso!');
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorStack = error instanceof Error ? error.stack : 'N/A';
      
      console.error('Erro ao adicionar vídeo do YouTube:', {
        errorMessage,
        url,
        errorStack
      });
      
      toast({
        title: "Erro ao adicionar vídeo",
        description: `Não foi possível adicionar o vídeo do YouTube: ${errorMessage}`,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DEBUG] handleYoutubeSubmit chamado com URL:', youtubeUrl);
    
    if (!youtubeUrl.trim()) {
      console.error('[DEBUG] URL do YouTube está vazia');
      return;
    }
    
    console.log('[DEBUG] Iniciando upload...');
    setUploading(true);
    
    try {
      const success = addYoutubeVideo(youtubeUrl);
      console.log('[DEBUG] Resultado de addYoutubeVideo:', success);
      
      if (success) {
        console.log('[DEBUG] Vídeo adicionado com sucesso');
        toast({
          title: "Vídeo adicionado",
          description: "O vídeo do YouTube foi adicionado com sucesso.",
          variant: "default",
        });
        // Limpa o campo após adicionar com sucesso
        setYoutubeUrl('');
      }
    } catch (error) {
      console.error('[DEBUG] Erro ao adicionar vídeo do YouTube:', error);
      toast({
        title: "Erro ao adicionar vídeo",
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao adicionar o vídeo.',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('Arquivos selecionados:', files);
    setUploading(true);
    const remainingSlots = maxFiles - medias.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length < files.length) {
      toast({
        title: "Limite de arquivos atingido",
        description: `Apenas ${remainingSlots} arquivos foram adicionados. Máximo de ${maxFiles} arquivos permitidos.`,
        variant: "default",
      });
    }

    try {
      const newMedias: MediaItem[] = [];
      
      for (const file of filesToUpload) {
        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : null;
        
        if (!fileType) {
          toast({
            title: "Tipo de arquivo não suportado",
            description: "Por favor, selecione apenas imagens ou vídeos.",
            variant: "destructive",
          });
          continue;
        }

        // Gera um nome único para o arquivo
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 7);
        const fileExt = file.name.split('.').pop();
        const filePath = `properties/${timestamp}-${randomId}.${fileExt}`;
        
        console.log(`Preparando upload de ${file.name} para ${filePath}...`);
        
        // Faz o upload para o Supabase Storage
        console.log(`Iniciando upload de ${file.name}...`);
        const { data, error } = await uploadFileWithRetry(filePath, file);
        
        if (error) {
          console.error('Erro ao fazer upload do arquivo:', error);
          toast({
            title: "Erro no upload",
            description: `Não foi possível fazer upload do arquivo ${file.name}. Tente novamente.`,
            variant: "destructive",
          });
          continue;
        }
        
        console.log(`Upload concluído para ${file.name}:`, data);
        
        // Obtém a URL pública do arquivo
        const publicUrl = getPublicUrl(data.path, data.bucket || 'publico');
        
        console.log(`URL pública gerada para ${file.name}:`, publicUrl);
        
        // Garante que o tipo seja um dos valores esperados
        const mediaType = fileType === 'image' || fileType === 'video' || fileType === 'youtube' 
          ? fileType 
          : 'image';
          
        // Adiciona a mídia à lista
        const newMedia: MediaItem = {
          url: publicUrl,
          type: mediaType,
          isNew: true,
          // Para imagens, usamos a própria URL como thumbnail
          // Para vídeos, poderíamos gerar um thumbnail aqui se necessário
          thumbnail: mediaType === 'image' ? publicUrl : undefined
        };
        
        console.log('Nova mídia adicionada:', newMedia);
        newMedias.push(newMedia);
      }

      // Atualiza a lista de mídias, garantindo que os vídeos fiquem no final
      console.log('Atualizando lista de mídias...');
      console.log('Novas mídias a serem adicionadas:', newMedias);
      
      setMedias(prev => {
        console.log('Mídias atuais:', prev);
        // Separa as mídias atuais em imagens e vídeos
        const currentImages = prev.filter(m => m.type !== 'youtube' && m.type !== 'video');
        const currentVideos = prev.filter(m => m.type === 'youtube' || m.type === 'video');
        
        // Separa as novas mídias em imagens e vídeos
        const newImages = newMedias.filter(m => m.type === 'image');
        const newVideos = newMedias.filter(m => m.type === 'video');
        
        // Combina tudo: imagens atuais + novas imagens + vídeos atuais + novos vídeos
        const updatedMedias = [
          ...currentImages, 
          ...newImages,
          ...currentVideos,
          ...newVideos
        ];
        
        // Se for a primeira mídia e for uma imagem, define como principal
        if (updatedMedias.length > 0 && !currentMainImage) {
          const firstImage = updatedMedias.find(m => m.type === 'image');
          if (firstImage) {
            const newMainImage = firstImage.thumbnail || firstImage.url;
            console.log('Definindo primeira imagem como principal:', newMainImage);
            setCurrentMainImage(newMainImage);
          } else if (updatedMedias[0]) {
            // Se não houver imagens, usa a primeira mídia disponível
            const newMainImage = updatedMedias[0].thumbnail || updatedMedias[0].url;
            console.log('Nenhuma imagem encontrada. Definindo primeira mídia como principal:', newMainImage);
            setCurrentMainImage(newMainImage);
          }
        }
        
        console.log('Mídias atualizadas (vídeos no final):', updatedMedias);
        return updatedMedias;
      });
      
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar os arquivos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      // Limpa o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    const newMedias = [...medias];
    const removedMedia = newMedias[index];
    
    // Se a mídia removida for a principal, define a próxima como principal
    if (removedMedia.url === currentMainImage) {
      const nextMedia = newMedias.find((_, i) => i !== index);
      setCurrentMainImage(nextMedia?.url || '');
    }
    
    // Revoga a URL temporária se for uma mídia nova
    if (removedMedia.isNew && removedMedia.file) {
      URL.revokeObjectURL(removedMedia.url);
    }
    
    newMedias.splice(index, 1);
    setMedias(newMedias);
  };

  const setAsMain = (url: string) => {
    setCurrentMainImage(url);
  };

  const uploadMedias = async (): Promise<{url: string; type: 'image' | 'video' | 'youtube'}[]> => {
    const uploadPromises = medias
      .filter(media => media.isNew)
      .map(async (media) => {
        try {
          // Se for um vídeo do YouTube, apenas retorna os dados
          if (media.type === 'youtube') {
            return { 
              url: media.url, 
              type: 'youtube' as const,
              thumbnail: media.thumbnail 
            };
          }
          
          // Para arquivos de mídia (imagens/vídeos)
          if (media.file) {
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 7);
            const fileExt = media.file.name.split('.').pop();
            const filePath = `properties/${timestamp}-${randomId}.${fileExt}`;
            
            const { data, error } = await uploadFileWithRetry(filePath, media.file);
            
            if (error) throw error;
            
            const publicUrl = getPublicUrl(data.path, data.bucket);
            return { url: publicUrl, type: media.type };
          }
          
          return { url: media.url, type: media.type };
        } catch (error) {
          console.error('Erro ao processar a mídia:', error);
          throw error;
        }
      });

    return Promise.all(uploadPromises);
  };

  return (
    <div className="space-y-4">
      {/* Upload de arquivos locais */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*"
          className="hidden"
          disabled={uploading || medias.length >= maxFiles}
        />
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <Video className="h-12 w-12 text-gray-400" />
          </div>
          <div className="text-sm text-gray-600">
            {medias.length >= maxFiles ? (
              <p>Limite máximo de {maxFiles} arquivos atingido</p>
            ) : (
              <p>Arraste e solte imagens ou vídeos aqui ou clique para selecionar</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || medias.length >= maxFiles}
            className="mt-2 w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Mídias Locais
          </Button>
          
          {/* Separador */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>
          
          {/* Adicionar vídeo do YouTube */}
          <div className="mt-4">
            <div className="space-y-2" onSubmit={(e) => {
              e.preventDefault();
              handleYoutubeSubmit(e as unknown as React.FormEvent);
            }}>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Cole a URL do YouTube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleYoutubeSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  disabled={uploading || medias.length >= maxFiles}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={!youtubeUrl.trim() || uploading || medias.length >= maxFiles}
                  onClick={(e) => {
                    e.preventDefault();
                    handleYoutubeSubmit(e as unknown as React.FormEvent);
                  }}
                >
                  <Youtube className="h-4 w-4 mr-2 text-red-500" />
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-gray-500">Exemplo: https://www.youtube.com/watch?v=...</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview de mídias */}
      {medias.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">
            Mídias selecionadas ({medias.length}/{maxFiles})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {medias.map((media, index) => (
              <div key={index} className="relative group">
                {media.type === 'youtube' ? (
                  <div className="relative h-24 w-full bg-gray-200 rounded-md overflow-hidden">
                    <img
                      src={media.thumbnail || `https://img.youtube.com/vi/${extractYoutubeId(media.url)}/hqdefault.jpg`}
                      alt="Miniatura do YouTube"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Youtube className="h-8 w-8 text-red-500" />
                    </div>
                  </div>
                ) : media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={`Mídia ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                ) : (
                  <div className="h-24 w-full bg-gray-200 flex items-center justify-center rounded-md">
                    <Video className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                
                {/* Botão de remover */}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                  title="Remover mídia"
                >
                  <X className="h-3 w-3" />
                </button>
                
                {/* Indicador de mídia principal */}
                {media.url === currentMainImage ? (
                  <div className="absolute bottom-0 left-0 right-0 bg-eliteOrange text-white text-xs py-1 text-center">
                    Principal
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAsMain(media.url)}
                    className="absolute bottom-0 left-0 right-0 bg-gray-800/70 text-white text-xs py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Definir como principal"
                  >
                    Tornar principal
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Clique em uma mídia para defini-la como principal. A primeira mídia é exibida como destaque.
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaManager;
