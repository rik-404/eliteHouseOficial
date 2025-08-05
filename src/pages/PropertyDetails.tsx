import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Square, Bed, Bath, Car, Video, Youtube, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModalContact from '@/components/ModalContact';
import { supabase } from '@/lib/supabase';
import { PropertyType } from '@/components/PropertyCard';
import { useToast } from '@/hooks/use-toast';

// Função para extrair o ID do YouTube de uma URL
const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

type PropertyMedia = {
  url: string;
  type: 'image' | 'video' | 'youtube';
  thumbnail?: string;
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<PropertyMedia | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Verificar se o imóvel está ativo (true) e não está vendido (false)
        if (data.status !== true || data.vendido === true) {
          let mensagem = "Este imóvel não está mais disponível.";
          
          if (data.vendido === true) {
            mensagem = "Este imóvel já foi vendido.";
          }
          
          toast({
            title: "Imóvel indisponível",
            description: mensagem,
            variant: "destructive"
          });
          // Redirecionar para a página de imóveis
          window.location.href = '/properties';
          return;
        }
        
        // Definir mídia selecionada inicial (sempre começa com a imagem principal)
        if (data.image_url) {
          setSelectedMedia({
            url: data.image_url,
            type: 'image'
          });
        } else if (data.additional_media && data.additional_media.length > 0) {
          // Se não houver imagem principal, usa a primeira mídia disponível
          const firstMedia = data.additional_media[0];
          setSelectedMedia({
            url: firstMedia.url,
            type: firstMedia.type || 'image'
          });
        }
        
        setProperty(data);
      } catch (error) {
        console.error('Erro ao carregar imóvel:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os detalhes do imóvel",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Imóvel não encontrado</h2>
          <p className="text-muted-foreground">O imóvel que você está procurando não foi encontrado.</p>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  // Extrair o ID do vídeo do YouTube da URL
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleMediaClick = (media: PropertyMedia, index: number) => {
    setSelectedMedia(media);
    setCurrentIndex(allMedias.findIndex(m => m.url === media.url));
    setShowGallery(true);
  };

  const navigateGallery = (direction: 'prev' | 'next') => {
    let newIndex = currentIndex;
    if (direction === 'prev') {
      newIndex = (currentIndex - 1 + allMedias.length) % allMedias.length;
    } else {
      newIndex = (currentIndex + 1) % allMedias.length;
    }
    setCurrentIndex(newIndex);
    setSelectedMedia(allMedias[newIndex]);
  };

  // Ordenar as mídias para garantir que a imagem principal venha primeiro
  // Processar todas as mídias do imóvel
  const allMedias = [
    // Imagem principal sempre vem primeiro
    ...(property.image_url ? [{
      url: property.image_url, 
      type: 'image' as const,
      thumbnail: property.image_url
    }] : []),
    
    // Mídias adicionais (imagens e vídeos)
    ...(Array.isArray(property.additional_media) 
      ? property.additional_media
          .filter((m: any) => m && m.url && typeof m.url === 'string')
          .map((m: any) => {
            // Verificar se é um vídeo do YouTube
            const isYoutube = m.type === 'youtube' || 
                            (m.url && (m.url.includes('youtube.com') || m.url.includes('youtu.be')));
            
            // Se for YouTube, formatar a URL de incorporação
            const url = isYoutube 
              ? `https://www.youtube.com/embed/${extractYoutubeId(m.url)}` 
              : m.url;
            
            // Determinar o tipo de mídia
            let mediaType = m.type || 'image';
            if (isYoutube) mediaType = 'youtube';
            else if (m.url?.match(/\.(mp4|webm|ogg)$/i)) mediaType = 'video';
            
            // Criar objeto de mídia padronizado
            return {
              url,
              type: mediaType as 'image' | 'video' | 'youtube',
              thumbnail: isYoutube 
                ? `https://img.youtube.com/vi/${extractYoutubeId(m.url)}/hqdefault.jpg`
                : m.thumbnail || m.url
            };
          })
      : [])
  ].filter((m, index, self) => 
    // Remover duplicatas baseado na URL
    m.url && 
    typeof m.url === 'string' && 
    self.findIndex(item => item.url === m.url) === index
  );
  
  console.log('Todas as mídias processadas:', allMedias);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container-custom py-16">
        {/* Título do imóvel destacado */}
        <h1 className="text-4xl font-bold mb-10 text-center text-eliteOrange drop-shadow-sm">{property.title}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galeria de Mídias */}
          <div>
            {/* Mídia principal */}
            <div className="relative mb-4 rounded-lg overflow-hidden bg-black/5 aspect-video">
              {selectedMedia?.type === 'youtube' ? (
                <div className="w-full h-full">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${extractYoutubeId(selectedMedia.url)}?autoplay=1&mute=1`}
                    title="Vídeo do imóvel"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : selectedMedia?.type === 'video' ? (
                <video 
                  src={selectedMedia.url} 
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <img
                  src={selectedMedia?.url || property.image_url || '/placeholder.jpg'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-eliteOrange text-white">
                  {property.type}
                </Badge>
                {property.featured && (
                  <Badge className="ml-2 bg-white/80 text-eliteBlue">
                    Destaque
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Miniaturas das mídias - Mostrar apenas as 4 primeiras */}
            {allMedias.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {allMedias.slice(0, 4).map((media, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleMediaClick(media, index)}
                    className={`relative aspect-square rounded-md overflow-hidden group ${selectedMedia?.url === media.url ? 'ring-2 ring-eliteOrange' : ''}`}
                  >

                    {media.type === 'youtube' ? (
                      <div className="relative w-full h-full">
                        <img
                          src={`https://img.youtube.com/vi/${extractYoutubeId(media.url)}/hqdefault.jpg`}
                          alt="Miniatura do YouTube"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Youtube className="h-6 w-6 text-red-500" />
                        </div>
                      </div>
                    ) : media.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video 
                          src={media.url} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={media.url}
                        alt={`Mídia ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Tratamento de erro para imagens que não carregam
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.jpg';
                        }}
                      />
                    )}
                    {index === 3 && allMedias.length > 4 && (
                      <div 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowGallery(true);
                        }}
                      >
                        <span className="text-white font-medium text-sm">+{allMedias.length - 4} mais</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Localização */}
            <div className="mt-6 p-6 bg-white/80 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4">Localização</h2>
              <p className="text-eliteOrange text-xl font-semibold">
                {property.location}, {property.city}/{property.uf}
              </p>
            </div>

            {/* Descrição abaixo da foto */}
            <div className="mt-6 p-6 bg-white/80 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>
          </div>

          {/* Detalhes do Imóvel */}
          <div className="space-y-8">
            {/* Card de Preço e Contato */}
            <div className="bg-white/90 rounded-xl border border-gray-200 shadow-sm p-6 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium text-gray-700">Comprar</span>
                <span className="text-xl font-bold text-gray-800">{formattedPrice}</span>
              </div>
              <hr className="my-4 border-gray-200" />
              <ModalContact propertiesId={property.id} />
            </div>
            {/* Seção de informações com ícones */}
            <div className="bg-white/80 rounded-lg border border-gray-200 px-8 py-6 mb-8">
              <hr className="mb-6 border-gray-200" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <Square className="mx-auto text-eliteOrange mb-2" />
                  <div className="text-base font-semibold text-gray-800">{property?.area}m²</div>
                  <div className="text-xs text-muted-foreground">Área total</div>
                </div>
                {property?.type !== 'Terreno' && (
                  <>
                    <div>
                      <Bed className="mx-auto text-eliteOrange mb-2" />
                      <div className="text-base font-semibold text-gray-800">{property?.bedrooms} quartos</div>
                      <div className="text-xs text-muted-foreground">&nbsp;</div>
                    </div>
                    <div>
                      <Bath className="mx-auto text-eliteOrange mb-2" />
                      <div className="text-base font-semibold text-gray-800">{property?.bathrooms} banheiro</div>
                      <div className="text-xs text-muted-foreground">&nbsp;</div>
                    </div>
                    <div>
                      <Car className="mx-auto text-eliteOrange mb-2" />
                      <div className="text-base font-semibold text-gray-800">{property?.garage} vaga</div>
                      <div className="text-xs text-muted-foreground">&nbsp;</div>
                    </div>
                  </>
                )}
              </div>
              <hr className="mt-6 border-gray-200" />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Galeria Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4">
            <button 
              onClick={() => setShowGallery(false)}
              className="text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="text-white">
              {currentIndex + 1} / {allMedias.length}
            </div>
            <div className="w-8"></div> {/* Para manter o layout balanceado */}
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            <button 
              onClick={() => navigateGallery('prev')}
              className="absolute left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <div className="max-w-4xl w-full h-full flex items-center justify-center">
              {selectedMedia?.type === 'youtube' ? (
                <div className="w-full aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${extractYoutubeId(selectedMedia.url)}?autoplay=1`}
                    title="Vídeo do imóvel"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : selectedMedia?.type === 'video' ? (
                <video 
                  src={selectedMedia.url} 
                  className="max-h-[80vh] max-w-full"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={selectedMedia?.url}
                  alt={property?.title}
                  className="max-h-[80vh] max-w-full object-contain"
                />
              )}
            </div>
            
            <button 
              onClick={() => navigateGallery('next')}
              className="absolute right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          
          {/* Miniaturas na parte inferior */}
          <div className="h-32 bg-black/50 overflow-x-auto py-2">
            <div className="flex justify-center space-x-2 px-4">
              {allMedias.map((media, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setSelectedMedia(media);
                  }}
                  className={`flex-shrink-0 w-24 h-24 rounded overflow-hidden ${currentIndex === index ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                >
                  {media.type === 'youtube' ? (
                    <img
                      src={`https://img.youtube.com/vi/${extractYoutubeId(media.url)}/hqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : media.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video 
                        src={media.url}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
