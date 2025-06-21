import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  mainImage: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, mainImage }) => {
  const allImages = mainImage ? [mainImage, ...images.filter(img => img !== mainImage)] : images;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Impedir rolagem quando o modal estiver aberto
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Restaurar rolagem
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
          closeModal();
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
                <img 
                  src={image} 
                  alt={`Imagem ${index + 1}`} 
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            ))}
            {allImages.length > 6 && (
              <div 
                className="aspect-square cursor-pointer relative"
                onClick={() => openModal(5)}
              >
                <img 
                  src={allImages[5]} 
                  alt={`Imagem 5`} 
                  className="w-full h-full object-cover rounded-md opacity-70"
                />
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
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Barra superior */}
            <div className="flex justify-between items-center p-4 text-white">
              <div className="text-sm">
                {currentIndex + 1} / {allImages.length}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeModal}
                className="text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </Button>
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
