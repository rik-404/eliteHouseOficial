import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadFileWithRetry, getPublicUrl } from '@/lib/uploadHelpers';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CustomForm from '@/components/ui/CustomForm';

interface PropertyMedia {
  url: string;
  type: 'image' | 'video' | 'youtube';
}

interface PropertyFormProps {
  property?: {
    id?: number;
    title: string;
    description: string;
    location: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    parking: number;
    area: number;
    price: number;
    status: string;
    image_url?: string;
    additional_media?: PropertyMedia[];
  };
}

const PropertyForm = ({ property }: PropertyFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  
  useEffect(() => {
    const loadNeighborhoods = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('location')
          .order('location', { ascending: true});

        if (error) throw error;
        
        if (data) {
          const uniqueNeighborhoods = [...new Set(data.map(property => property.location))];
          setNeighborhoods(uniqueNeighborhoods);
        }
      } catch (error) {
        console.error('Erro ao carregar bairros:', error);
      }
    };

    loadNeighborhoods();
  }, []);
  
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    location: property?.location || '',
    type: property?.type || 'Apartamento',
    bedrooms: property?.bedrooms || 3,
    bathrooms: property?.bathrooms || 2,
    parking: property?.parking || 1,
    area: property?.area || 100,
    price: property?.price || 500000,
    status: property?.status || 'ativo',
    image_url: property?.image_url || ''
  });
  
  const [images, setImages] = useState<Array<{url: string; file?: File; type?: 'image' | 'video' | 'youtube'}>>(
    property?.additional_media?.map(media => ({ 
      url: media.url,
      type: media.type 
    })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Limitar o número total de imagens a 15
      const remainingSlots = 15 - images.length;
      const newFiles = Array.from(files).slice(0, remainingSlots);
      
      if (newFiles.length < files.length) {
        toast({
          title: "Limite de imagens atingido",
          description: `Apenas ${remainingSlots} imagens foram adicionadas. Máximo de 15 imagens por imóvel.`,
          variant: "default"
        });
      }
      
      // Verificar tipos de arquivo
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
      
      if (validFiles.length < newFiles.length) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Alguns arquivos não são imagens e foram ignorados.",
          variant: "destructive"
        });
      }
      
      // Adicionar os novos arquivos à lista de uploads
      setFilesToUpload(prev => [...prev, ...validFiles]);
      
      // Adicionar placeholders para visualização
      const newImages = [...images];
      for (const file of validFiles) {
        newImages.push({ 
          url: URL.createObjectURL(file), 
          file 
        });
      }
      
      setImages(newImages);
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar as imagens.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Limpar o input de arquivo para permitir selecionar os mesmos arquivos novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    const removedImage = newImages[index];
    
    // Se a imagem tiver uma URL temporária, revogá-la para liberar memória
    if (removedImage.file) {
      URL.revokeObjectURL(removedImage.url);
      // Remover o arquivo da lista de uploads
      setFilesToUpload(prev => prev.filter(file => file !== removedImage.file));
    }
    
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Primeiro, fazer upload de todas as novas imagens
      const uploadedImages = [];
      let mainImageUrl = formData.image_url;
      
      // Processar primeiro as imagens existentes (já estão no servidor)
      for (const image of images) {
        if (!image.file && image.url) {
          uploadedImages.push(image.url);
        }
      }
      
      // Fazer upload das novas imagens
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 7);
        const fileExt = file.name.split('.').pop();
        const filePath = `properties/${timestamp}-${randomId}.${fileExt}`;
        
        const { data, error } = await uploadFileWithRetry(filePath, file);
        
        if (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          toast({
            title: "Erro no upload",
            description: `Não foi possível fazer upload da imagem ${i+1}.`,
            variant: "destructive"
          });
          continue;
        }
        
        const publicUrl = getPublicUrl(data.path, data.bucket);
        uploadedImages.push(publicUrl);
        
        // Se for a primeira imagem e não houver imagem principal definida, usá-la como principal
        if (i === 0 && !mainImageUrl) {
          mainImageUrl = publicUrl;
        }
      }
      
      // Preparar os dados para salvar no banco de dados
      const propertyData = {
        ...formData,
        image_url: mainImageUrl,
        additional_media: uploadedImages.map(url => ({
          url,
          type: 'image' // Assumindo que todas as imagens são do tipo 'image'
        }))
      };

      // Verificar se é uma atualização ou criação de novo imóvel
      if (property?.id) {
        // Atualizar imóvel existente
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);

        if (error) throw error;
      } else {
        // Criar novo imóvel
        const { error } = await supabase
          .from('properties')
          .insert([propertyData]);

        if (error) throw error;
      }
      
      toast({
        title: "Sucesso",
        description: `Imóvel ${property?.id ? 'atualizado' : 'cadastrado'} com sucesso!`,
      });
      
      // Navegar de volta para a lista de propriedades
      navigate('/admin/properties');
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o imóvel.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <CustomForm onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Location and Type */}
        <div className="space-y-4">
          <div>
            <Label>Bairro</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData({ ...formData, location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o bairro" />
              </SelectTrigger>
              <SelectContent>
                {neighborhoods.map((neighborhood: string) => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo de Imóvel</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apartamento">Apartamento</SelectItem>
                <SelectItem value="Casa">Casa</SelectItem>
                <SelectItem value="Cobertura">Cobertura</SelectItem>
                <SelectItem value="Terreno">Terreno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Features */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quartos</Label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Banheiros</Label>
              <Input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Vagas na Garagem</Label>
              <Input
                type="number"
                value={formData.parking}
                onChange={(e) => setFormData({ ...formData, parking: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Área (m²)</Label>
              <Input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </div>

        {/* Price and Status */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Preço</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="col-span-2 space-y-4">
        <Label>Imagens do Imóvel (máximo 15)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleImageUpload(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
            disabled={uploading || images.length >= 15}
          />
          <div className="space-y-2">
            <div className="flex justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <div className="text-sm text-gray-600">
              {images.length >= 15 ? (
                <p>Limite máximo de 15 imagens atingido</p>
              ) : (
                <p>Arraste e solte imagens aqui ou clique para selecionar</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= 15}
              className="mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Imagens
            </Button>
          </div>
        </div>
        
        {/* Image Preview */}
        {images.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Imagens selecionadas ({images.length}/15)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Imagem ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-eliteOrange text-white text-xs py-1 text-center">
                      Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              A primeira imagem será usada como imagem principal do imóvel.
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="bg-eliteOrange hover:bg-eliteOrange-light"
          disabled={uploading}
        >
          {uploading ? 'Salvando...' : (property ? 'Atualizar Imóvel' : 'Cadastrar Imóvel')}
        </Button>
      </div>
    </CustomForm>
  );
};

export default PropertyForm;
