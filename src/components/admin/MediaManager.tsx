import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadFileWithRetry, getPublicUrl } from '@/lib/uploadHelpers';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  file?: File;
  isNew?: boolean;
}

interface MediaManagerProps {
  initialMedias?: Array<{ url: string; type: 'image' | 'video' }>;
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

  const uploadMedias = async (): Promise<{url: string; type: 'image' | 'video'}[]> => {
    const uploadPromises = medias
      .filter(media => media.isNew && media.file)
      .map(async (media) => {
        try {
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 7);
          const fileExt = media.file!.name.split('.').pop();
          const filePath = `properties/${timestamp}-${randomId}.${fileExt}`;
          
          const { data, error } = await uploadFileWithRetry(filePath, media.file!);
          
          if (error) throw error;
          
          const publicUrl = getPublicUrl(data.path, data.bucket);
          return { url: publicUrl, type: media.type };
        } catch (error) {
          console.error('Erro ao fazer upload da mídia:', error);
          throw error;
        }
      });

    return Promise.all(uploadPromises);
  };

  return (
    <div className="space-y-4">
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
        <div className="space-y-2">
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
            className="mt-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Mídias
          </Button>
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
                {media.type === 'image' ? (
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
