import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images?: string[] | null;
  mainImage: string;
  onImageLoadError?: (imageUrl: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = (props) => {
  const { images = [], mainImage, onImageLoadError } = props;
  // Garante que images seja um array e filtra valores vazios/nulos
  const safeImages = useMemo(() => {
    try {
      return Array.isArray(images) ? images.filter((img): img is string => 
        typeof img === 'string' && img.trim() !== ''
      ) : [];
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
      return [];
    }
  }, [images]);
  
  // Cria o array de todas as imagens, garantindo que não haja duplicatas
  const allImages = useMemo(() => {
    try {
      const uniqueImages = new Set<string>();
      
      // Adiciona a imagem principal primeiro, se existir
      if (mainImage && typeof mainImage === 'string' && mainImage.trim() !== '') {
        // Se for uma URL remota que falhou ao carregar, tenta converter para base64
        uniqueImages.add(mainImage);
      }
      
      // Adiciona as imagens adicionais, garantindo que não sejam iguais à principal
      safeImages.forEach(img => {
        if (img && img !== mainImage) {
          uniqueImages.add(img);
        }
      });
      
      return Array.from(uniqueImages);
    } catch (error) {
      console.error('Erro ao processar todas as imagens:', error);
      return [];
    }
  }, [mainImage, safeImages]);
  
  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, imageUrl: string) => {
    try {
      console.error('Erro ao carregar a imagem:', imageUrl);
      const target = e.target as HTMLImageElement;
      
      // Se a imagem não for base64 e não conseguir carregar, chama o callback se existir
      if (!imageUrl.startsWith('data:image') && !imageUrl.startsWith('blob:')) {
        if (onImageLoadError) {
          onImageLoadError(imageUrl);
        }
      }
      
      // Define uma imagem de fallback
      target.onerror = null; // Previne loops de erro
      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0ZDRkNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+';
    } catch (error) {
      console.error('Erro ao processar falha no carregamento da imagem:', error);
    }
  };
  
  // onImageLoadError já está disponível via desestruturação das props
  
  // Se não houver imagens, retorna uma mensagem
  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Nenhuma imagem disponível</p>
      </div>
    );
  }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Impedir rolagem quando o modal estiver aberto
  };

  const closeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Restaurar rolagem
  };
  
  const handleBackdropClick = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Manipular teclas de seta e ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          setIsModalOpen(false);
          document.body.style.overflow = 'auto';
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
      {/* Galeria de miniaturas */}
      <div className="space-y-4">
        {/* Imagem principal */}
        <div 
          className="relative aspect-[4/3] cursor-pointer" 
          onClick={() => openModal(0)}
        >
          <img 
            src={allImages[0]} 
            alt="Imagem principal" 
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {allImages.length} fotos
          </div>
        </div>

        {/* Miniaturas */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {allImages.slice(1, 6).map((image, index) => (
              <div 
                key={index} 
                className="aspect-square cursor-pointer"
                onClick={() => openModal(index + 1)}
              >
                <div className="w-full h-full relative">
                  <img 
                    src={image} 
                    alt={`Imagem ${index + 1}`} 
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => handleImageError(e, image)}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
            {allImages.length > 6 && (
              <div 
                className="aspect-square cursor-pointer relative"
                onClick={() => openModal(5)}
              >
                <div className="w-full h-full relative">
                  <img 
                    src={allImages[0]} 
                    alt="Imagem principal do imóvel" 
                    className="w-full h-full object-cover rounded-lg cursor-zoom-in"
                    onClick={() => openModal(0)}
                    onError={(e) => handleImageError(e, allImages[0])}
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-md">
                  +{allImages.length - 5}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de visualização em tela cheia */}
      {isModalOpen && (
        <div 
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={handleBackdropClick}
      >
          <div 
            className="relative w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior */}
            <div className="flex justify-between items-center p-4 text-white">
              <div className="text-sm">
                {currentIndex + 1} / {allImages.length}
              </div>
              <div className="relative">
                <button 
                  type="button"
                  onClick={(e) => closeModal(e)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 w-10 text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Imagem principal */}
            <div className="flex-1 flex items-center justify-center p-4">
              <img 
                src={allImages[currentIndex]} 
                alt={`Imagem ${currentIndex + 1}`} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            {/* Controles de navegação */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToPrevious}
                className="text-white hover:bg-white/20 rounded-full h-12 w-12 ml-4"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToNext}
                className="text-white hover:bg-white/20 rounded-full h-12 w-12 mr-4"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
            
            {/* Miniaturas na parte inferior */}
            <div className="p-4">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`h-16 w-16 flex-shrink-0 cursor-pointer ${
                      currentIndex === index ? 'ring-2 ring-eliteOrange' : ''
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`Miniatura ${index + 1}`} 
                      className="h-full w-full object-cover rounded-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
