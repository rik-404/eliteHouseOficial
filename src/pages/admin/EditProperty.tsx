import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/TempAuthContext';
import { Button } from '@/components/ui/button';
import { PropertyFormData } from '@/types/property';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Pencil, Image as ImageIcon, Video } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import MediaManager, { MediaItem } from '@/components/admin/MediaManager';
import CustomForm from '@/components/ui/CustomForm';

// Definindo o tipo para as mídias adicionais
type MediaType = 'image' | 'video' | 'youtube';

interface AdditionalMedia {
  url: string;
  type: MediaType;
  thumbnail?: string;
  isNew?: boolean; // Adicionado para controle de novas mídias
}

const EditProperty = () => {
  // Função para extrair ID do YouTube de uma URL
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyFormData & { additional_media: AdditionalMedia[] }>({
    reference: '',
    title: '',
    type: '',
    location: '',
    city: 'Piracicaba',
    uf: 'SP',
    area: '',
    bedrooms: '',
    bathrooms: '',
    garage: '',
    price: '',
    description: '',
    image_url: '',
    additional_media: [],
    featured: false,
    status: true, // true para ativo, false para inativo
    vendido: false
  });
  
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [mainImage, setMainImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [initialMediasLoaded, setInitialMediasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        const propertyData: PropertyFormData & { additional_media: AdditionalMedia[] } = {
          ...data,
          status: Boolean(data.status),
          vendido: Boolean(data.vendido),
          featured: Boolean(data.featured),
          additional_media: data.additional_media || [],
          broker_id: data.broker_id || user?.broker_id || null
        };
        
        setProperty(propertyData);
      } catch (error) {
        console.error('Erro ao carregar imóvel:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar o imóvel",
          variant: "destructive"
        });
        navigate('/admin/properties');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProperty();
    } else {
      navigate('/admin/properties');
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    const loadInitialMedias = async () => {
      if (property.image_url && !initialMediasLoaded) {
        const initialMedias: MediaItem[] = [];
        
        // Adiciona a imagem principal
        if (property.image_url) {
          initialMedias.push({
            url: property.image_url,
            type: 'image',
            isNew: false
          });
        }
        
        // Adiciona mídias adicionais
        if (property.additional_media && Array.isArray(property.additional_media)) {
          property.additional_media.forEach(media => {
            const validTypes: MediaType[] = ['image', 'video', 'youtube'];
            const mediaType = validTypes.includes(media.type as MediaType) 
              ? media.type as MediaType 
              : 'image'; // Valor padrão se o tipo for inválido
              
            if (media.url && mediaType) {
              initialMedias.push({
                url: media.url,
                type: mediaType,
                isNew: false,
                ...(media.thumbnail && { thumbnail: media.thumbnail })
              });
            }
          });
        }
        
        setMediaFiles(initialMedias);
        setMainImage(property.image_url);
        setInitialMediasLoaded(true);
      }
    };
    
    loadInitialMedias();
  }, [property.image_url, property.additional_media, initialMediasLoaded]);

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!id) {
    return <div className="text-center py-8">ID do imóvel não encontrado</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProperty(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'vendido') {
      setProperty(prev => ({
        ...prev,
        vendido: Boolean(checked),
        status: checked ? false : prev.status
      }));
    } else {
      setProperty(prev => ({
        ...prev,
        [name]: Boolean(checked)
      }));
    }
  };

  const handleStatusChange = (isActive: boolean) => {
    setProperty(prev => ({
      ...prev,
      status: Boolean(isActive),
      vendido: isActive ? Boolean(prev.vendido) : false
    } as const));
  };

  const handleMediaChange = (updatedMedias: MediaItem[], mainImageUrl: string) => {
    setMediaFiles(updatedMedias);
    setProperty(prev => ({
      ...prev,
      image_url: mainImageUrl
    }));
  };

  const uploadNewMedias = async (): Promise<AdditionalMedia[]> => {
    // Como o MediaManager já fez o upload das mídias, apenas mapeamos para o formato esperado
    return mediaFiles
      .filter(media => media.isNew) // Apenas mídias novas
      .map(media => ({
        url: media.url,
        type: media.type,
        ...(media.thumbnail && { thumbnail: media.thumbnail })
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!property.title || !property.type || !property.location) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    // Validar imagens
    if (mediaFiles.length === 0) {
      toast({
        title: "Imagem obrigatória",
        description: "Adicione pelo menos uma imagem do imóvel",
        variant: "destructive"
      });
      return;
    }
    
    // Validar imagem principal
    if (!mainImage || !mediaFiles.some(media => media.type === 'image' && media.url === mainImage)) {
      toast({
        title: "Imagem principal",
        description: "Selecione uma imagem principal para o imóvel",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);

    // Validar campos obrigatórios
    try {
      // Primeiro, fazer upload das novas mídias
      const uploadedMedias = await uploadNewMedias();
      
      // Combinar mídias existentes com as novas
      const existingMedias = property.additional_media.map(media => ({
        url: media.url,
        type: media.type as 'image' | 'video' | 'youtube',
        ...(media.thumbnail && { thumbnail: media.thumbnail })
      }));

      const allMedias = [...existingMedias, ...uploadedMedias];
      
      // Preparar dados para atualização
      const updateData = {
        reference: property.reference,
        title: property.title,
        type: property.type,
        location: property.location,
        city: property.city,
        uf: property.uf,
        area: parseInt(property.area) || 0,
        bedrooms: parseInt(property.bedrooms) || 0,
        bathrooms: parseInt(property.bathrooms) || 0,
        garage: parseInt(property.garage) || 0,
        price: parseFloat(property.price) || 0,
        description: property.description,
        image_url: mainImage,
        additional_media: allMedias
          .filter(media => media.url !== mainImage)
          .map(media => ({
            url: media.url,
            type: media.type,
            ...(media.thumbnail && { thumbnail: media.thumbnail })
          })),
        featured: property.featured,
        status: property.vendido ? false : Boolean(property.status), // Se vendido, status = false (inativo)
        vendido: property.vendido,
        broker_id: property.broker_id || user?.broker_id || null // Mantém o broker_id existente ou usa o do usuário atual
      };

      // Atualizar o imóvel no banco de dados
      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Se chegou até aqui, o imóvel foi atualizado com sucesso
      toast({
        title: "Sucesso",
        description: "Imóvel atualizado com sucesso"
      });

      // Redirecionar de volta para a lista de imóveis
      navigate('/admin/properties');
    } catch (error) {
      console.error('Erro ao atualizar imóvel:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o imóvel",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Editar Imóvel</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <CustomForm onSubmit={handleSubmit} id="property-form" className="space-y-6">
          {/* Seção de Mídias */}
          <div className="border-t border-b border-gray-200 py-6">
            <h3 className="text-lg font-medium mb-4">Mídias do Imóvel</h3>
            {initialMediasLoaded && (
              <MediaManager
                initialMedias={mediaFiles}
                mainImageUrl={mainImage}
                onChange={(updatedMedias: MediaItem[], mainImg: string) => {
                  setMediaFiles(updatedMedias);
                  setMainImage(mainImg);
                }}
                maxFiles={15}
              />
            )}
            <p className="text-xs text-gray-500 mt-2">
              Adicione fotos e vídeos do imóvel. A primeira mídia será usada como imagem principal.
            </p>
          </div>
          
          <input type="hidden" id="property-id" value={id} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="admin-form-group">
              <Label htmlFor="property-reference">Referência</Label>
              <Input
                id="property-reference"
                name="reference"
                value={property.reference}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-title">Título</Label>
              <Input
                id="property-title"
                name="title"
                value={property.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-type">Tipo</Label>
              <Select
                value={property.type}
                onValueChange={(value) => setProperty(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Apartamento">Apartamento</SelectItem>
                  <SelectItem value="Terreno">Terreno</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-location">Localização</Label>
              <Input
                id="property-location"
                name="location"
                value={property.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-city">Cidade</Label>
              <Input
                id="property-city"
                name="city"
                value={property.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-uf">UF</Label>
              <Input
                id="property-uf"
                name="uf"
                value={property.uf}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-area">Área (m²)</Label>
              <Input
                id="property-area"
                name="area"
                type="number"
                value={property.area}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-bedrooms">Quartos</Label>
              <Input
                id="property-bedrooms"
                name="bedrooms"
                type="number"
                value={property.bedrooms}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-bathrooms">Banheiros</Label>
              <Input
                id="property-bathrooms"
                name="bathrooms"
                type="number"
                value={property.bathrooms}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-garage">Garagem</Label>
              <Input
                id="property-garage"
                name="garage"
                type="number"
                value={property.garage}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="admin-form-group">
              <Label htmlFor="property-price">Preço</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                <Input
                  id="property-price"
                  name="price"
                  type="number"
                  value={property.price}
                  onChange={handleInputChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="admin-form-group md:col-span-2">
              <Label htmlFor="property-description">Descrição</Label>
              <Textarea
                id="property-description"
                name="description"
                value={property.description}
                onChange={handleInputChange}
                rows={5}
                required
              />
            </div>
            {/* Gerenciador de mídia foi movido para o topo do formulário */}
            <div className="admin-form-group">
              <Label htmlFor="property-featured">Destaque</Label>
              {user?.role === 'corretor' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="property-featured"
                    name="featured"
                    checked={property.featured}
                    disabled
                  />
                  <span className="text-destructive">Você não tem permissão para alterar o status de destaque</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="property-featured"
                    name="featured"
                    checked={property.featured}
                    onChange={handleCheckboxChange}
                  />
                  <Label htmlFor="property-featured">Sim</Label>
                </div>
              )}
            </div>
            <div className="admin-form-group">
              <div className="space-y-2">
                <div className="font-medium">Status do Imóvel</div>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      checked={Boolean(property.status) === true}
                      onChange={() => handleStatusChange(true)}
                      className="text-eliteOrange focus:ring-eliteOrange"
                    />
                    <span>Ativo</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="status"
                      checked={Boolean(property.status) === false}
                      onChange={() => handleStatusChange(false)}
                      className="text-eliteOrange focus:ring-eliteOrange"
                    />
                    <span>Inativo</span>
                  </label>
                </div>
                <div className="text-xs text-gray-500">
                  {property.status 
                    ? 'O imóvel está visível no site' 
                    : 'O imóvel não está visível no site'}
                </div>
              </div>
            </div>
            
            <div className="admin-form-group">
              <div className="space-y-2">
                <div className="font-medium">Situação do Imóvel</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="property-vendido"
                    name="vendido"
                    checked={property.vendido}
                    onChange={(e) => {
                      const isSold = e.target.checked;
                      setProperty(prev => ({
                        ...prev,
                        vendido: isSold,
                        status: isSold ? false : prev.status
                      }));
                    }}
                    className="text-eliteOrange focus:ring-eliteOrange"
                    disabled={!property.status}
                  />
                  <Label htmlFor="property-vendido">Marcar como vendido</Label>
                </div>
                <div className="text-xs text-gray-500">
                  {property.vendido 
                    ? 'Este imóvel está marcado como vendido e não aparecerá no site' 
                    : 'Marque se este imóvel foi vendido'}
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-eliteOrange hover:bg-eliteOrange-light text-white"
            disabled={uploading}
          >
            {uploading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CustomForm>
      </div>
    </div>
  );
};

export default EditProperty;
