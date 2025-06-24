import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Square, Bed, Bath, Car, Video, Youtube } from 'lucide-react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModalContact from '@/components/ModalContact';
import { supabase } from '@/lib/supabase';
import { PropertyType } from '@/components/PropertyCard';
import { useToast } from '@/hooks/use-toast';

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
        
        // Verificar se o imóvel está ativo e não está vendido
        if (data.status === false || data.vendido === true) {
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
        
        // Definir mídia selecionada inicial (imagem principal ou primeiro vídeo)
        if (data.additional_media && data.additional_media.length > 0) {
          const firstVideo = data.additional_media.find((m: any) => m.type === 'youtube' || m.type === 'video');
          if (firstVideo) {
            setSelectedMedia({
              url: firstVideo.url,
              type: firstVideo.type
            });
          } else if (data.image_url) {
            setSelectedMedia({
              url: data.image_url,
              type: 'image'
            });
          }
        } else if (data.image_url) {
          setSelectedMedia({
            url: data.image_url,
            type: 'image'
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

  const handleMediaClick = (media: PropertyMedia) => {
    setSelectedMedia(media);
  };

  // Obter todas as mídias (imagens e vídeos) para a galeria
  const allMedias = [
    { url: property.image_url, type: 'image' as const },
    ...(Array.isArray(property.additional_images) 
      ? property.additional_images.map((url: string) => ({ 
          url, 
          type: 'image' as const 
        })) 
      : []),
    ...(Array.isArray(property.additional_media) 
      ? property.additional_media.map((m: any) => ({
          url: m.url,
          type: m.type,
          thumbnail: m.type === 'youtube' 
            ? `https://img.youtube.com/vi/${extractYoutubeId(m.url)}/hqdefault.jpg` 
            : m.url
        })) 
      : [])
  ].filter(m => m.url && typeof m.url === 'string');

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
            
            {/* Miniaturas das mídias */}
            {allMedias.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {allMedias.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => handleMediaClick(media)}
                    className={`relative aspect-square rounded-md overflow-hidden ${selectedMedia?.url === media.url ? 'ring-2 ring-eliteOrange' : ''}`}
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
    </div>
  );
};

export default PropertyDetails;
