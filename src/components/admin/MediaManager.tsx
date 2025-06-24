import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon, Video, Trash2, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadFileWithRetry, getPublicUrl } from '@/lib/uploadHelpers';
import { Input } from '@/components/ui/input';
import CustomForm from '@/components/ui/CustomForm';

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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const addYoutubeVideo = (url: string) => {
    try {
      const videoId = extractYoutubeId(url);
      if (!videoId) {
        throw new Error('URL do YouTube inválida');
      }

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      const newMedia: MediaItem = {
        url: embedUrl,
        type: 'youtube',
        thumbnail: thumbnailUrl,
        isNew: true
      };

      setMedias(prev => {
        const updatedMedias = [...prev, newMedia];
        
        // Se for a primeira mídia e não houver imagem principal, define como principal
        if (updatedMedias.length === 1 && !currentMainImage) {
          setCurrentMainImage(thumbnailUrl);
        }
        
        return updatedMedias;
      });

      setYoutubeUrl('');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar vídeo do YouTube:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o vídeo do YouTube. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    
    setUploading(true);
    const success = addYoutubeVideo(youtubeUrl);
    setUploading(false);
    
    if (success) {
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo do YouTube foi adicionado com sucesso.",
        variant: "default",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newMedias = [...medias];
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

        const tempUrl = URL.createObjectURL(file);
        newMedias.push({
          url: tempUrl,
          type: fileType,
          file,
          isNew: true,
        });

        // Se for a primeira mídia e não houver imagem principal, define como principal
        if (newMedias.length === 1 && !currentMainImage) {
          setCurrentMainImage(tempUrl);
        }
      }

      setMedias(newMedias);
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar os arquivos.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            <CustomForm onSubmit={handleYoutubeSubmit} className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Cole a URL do YouTube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={uploading || medias.length >= maxFiles}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  variant="outline"
                  disabled={!youtubeUrl.trim() || uploading || medias.length >= maxFiles}
                >
                  <Youtube className="h-4 w-4 mr-2 text-red-500" />
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-gray-500">Exemplo: https://www.youtube.com/watch?v=...</p>
            </CustomForm>
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
