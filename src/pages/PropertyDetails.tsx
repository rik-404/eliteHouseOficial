import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Square, Bed, Bath, Car } from 'lucide-react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ImageGallery from '@/components/ImageGallery';
import ModalContact from '@/components/ModalContact';
import { supabase } from '@/lib/supabase';
import { PropertyType } from '@/components/PropertyCard';
import { useToast } from '@/hooks/use-toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container-custom py-16">
        {/* Título do imóvel destacado */}
        <h1 className="text-4xl font-bold mb-10 text-center text-eliteOrange drop-shadow-sm">{property.title}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galeria de Imagens */}
          <div>
            <ImageGallery 
              mainImage={property.image_url} 
              images={property.images || []} 
            />
            
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
