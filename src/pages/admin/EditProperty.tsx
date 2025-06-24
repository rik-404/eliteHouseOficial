import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/TempAuthContext';
import { Button } from '@/components/ui/button';
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

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [property, setProperty] = useState({
    reference: '',
    title: '',
    type: '',
    location: '',
    city: '',
    uf: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    garage: '',
    price: '',
    description: '',
    image_url: '',
    additional_images: [] as string[],
    additional_media: [] as Array<{url: string; type: 'image' | 'video' | 'youtube'}>,
    featured: false,
    status: true, // true para ativo, false para inativo
    vendido: false
  });
  
  const [medias, setMedias] = useState<MediaItem[]>([]);
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
        
        const propertyData = {
          ...data,
          status: Boolean(data.status),
          vendido: Boolean(data.vendido),
          featured: Boolean(data.featured),
          additional_images: data.additional_images || [],
          additional_media: data.additional_media || []
        };
        
        setProperty(propertyData);
        
        const initialMedias: MediaItem[] = [];
        
        // Adiciona a imagem principal
        if (propertyData.image_url) {
          initialMedias.push({ 
            url: propertyData.image_url, 
            type: 'image', 
            isNew: false 
          });
        }
        
        // Adiciona mídias adicionais do campo additional_media
        if (Array.isArray(propertyData.additional_media)) {
          propertyData.additional_media.forEach(media => {
            if (media.url && media.type) {
              // Se for uma URL remota, verifica se é uma imagem para converter
              if (media.type === 'image' && !media.url.startsWith('data:image')) {
                // Se for uma URL remota, converte para base64
                fetch(media.url)
                  .then(response => response.blob())
                  .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64data = reader.result as string;
                      // Atualiza a URL para a versão base64
                      media.url = base64data;
                      // Atualiza o estado com a nova URL
                      setMedias(prev => [
                        ...prev.filter(m => m.url !== media.url),
                        { url: base64data, type: 'image', isNew: false }
                      ]);
                    };
                    reader.readAsDataURL(blob);
                  })
                  .catch(error => {
                    console.error('Erro ao converter imagem remota:', error);
                  });
              }
              
              initialMedias.push({ 
                url: media.url, 
                type: media.type, 
                isNew: false 
              });
            }
          });
        }
        
        // Adiciona imagens adicionais do campo legado additional_images
        if (Array.isArray(propertyData.additional_images)) {
          propertyData.additional_images.forEach(url => {
            if (url && !initialMedias.some(m => m.url === url)) {
              // Se for uma URL remota, converte para base64
              if (!url.startsWith('data:image')) {
                fetch(url)
                  .then(response => response.blob())
                  .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64data = reader.result as string;
                      // Atualiza o estado com a nova URL
                      setMedias(prev => [
                        ...prev.filter(m => m.url !== url),
                        { url: base64data, type: 'image', isNew: false }
                      ]);
                    };
                    reader.readAsDataURL(blob);
                  })
                  .catch(error => {
                    console.error('Erro ao converter imagem remota:', error);
                  });
              }
              
              initialMedias.push({ 
                url, 
                type: 'image', 
                isNew: false 
              });
            }
          });
        }
        
        setMedias(initialMedias);
        setInitialMediasLoaded(true);
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

  const handleMediaChange = (updatedMedias: Array<{ url: string; type: 'image' | 'video' | 'youtube' }>, mainImageUrl: string) => {
    setMedias(updatedMedias);
    setProperty(prev => ({
      ...prev,
      image_url: mainImageUrl
    }));
  };

  const uploadNewMedias = async (): Promise<{url: string; type: 'image' | 'video' | 'youtube'}[]> => {
    const newMedias = medias.filter(media => media.isNew && (media.file || media.type === 'youtube'));
    const uploadedMedias: {url: string; type: 'image' | 'video' | 'youtube'}[] = [];
    
    for (const media of newMedias) {
      try {
        // Se for uma imagem, converte para base64 para armazenamento local
        if (media.file && media.type === 'image') {
          const reader = new FileReader();
          
          const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(media.file!);
          });
          
          uploadedMedias.push({
            url: base64Data,
            type: 'image'
          });
        } else if (media.file) {
          // Para vídeos, continua usando o armazenamento remoto
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 7);
          const fileExt = media.file.name.split('.').pop();
          const filePath = `properties/${timestamp}-${randomId}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('properties')
            .upload(filePath, media.file);
          
          if (error) throw error;
          
          const publicUrl = supabase.storage
            .from('properties')
            .getPublicUrl(data.path).data.publicUrl;
          
          uploadedMedias.push({
            url: publicUrl,
            type: 'video'
          });
        }
      } catch (error) {
        console.error('Erro ao processar a mídia:', error);
        throw error;
      }
    }
    
    return uploadedMedias;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Fazer upload das novas mídias
      const uploadedMedias = await uploadNewMedias();
      
      // Combinar mídias existentes com as novas
      const existingMedias = medias
        .filter(media => !media.isNew)
        .map(media => ({
          url: media.url,
          type: media.type
        }));
      
      const allMedias = [...existingMedias, ...uploadedMedias];
      
      // Separar a imagem principal das outras mídias
      const mainImage = property.image_url || (allMedias[0]?.url || '');
      const additionalMedia = allMedias
        .filter(media => media.url !== mainImage)
        .map(({ url, type }) => ({ url, type }));

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
        additional_media: additionalMedia,
        featured: property.featured,
        vendido: property.vendido,
        status: property.vendido ? false : Boolean(property.status)
      };

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Imóvel atualizado com sucesso"
      });

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
                initialMedias={medias}
                mainImageUrl={property.image_url}
                onChange={handleMediaChange}
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
            <div className="admin-form-group">
              <Label htmlFor="property-image">Imagem</Label>
              <Input
                id="property-image"
                name="image_url"
                value={property.image_url}
                onChange={handleInputChange}
                required
              />
            </div>
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
