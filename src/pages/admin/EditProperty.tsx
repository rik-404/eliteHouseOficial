import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/TempAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
    featured: false
  });
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
        
        setProperty(data);
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
    setProperty(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          reference: property.reference,
          title: property.title,
          type: property.type,
          location: property.location,
          city: property.city,
          uf: property.uf,
          area: parseInt(property.area),
          bedrooms: parseInt(property.bedrooms),
          bathrooms: parseInt(property.bathrooms),
          garage: parseInt(property.garage),
          price: parseFloat(property.price),
          description: property.description,
          image_url: property.image_url,
          featured: property.featured
        })
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
    }
    // Implementar lógica de atualização no backend
    console.log('Updated property:', property);
    navigate('/admin/properties');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Editar Imóvel</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} id="property-form" className="space-y-6">
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
            <Input
              id="property-price"
              name="price"
              type="number"
              value={property.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-span-full">
            <Label htmlFor="property-description">Descrição</Label>
            <Textarea
              id="property-description"
              name="description"
              value={property.description}
              onChange={handleInputChange}
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
        </div>

        <Button type="submit" className="w-full bg-eliteOrange hover:bg-eliteOrange-light text-white">
          Salvar Alterações
        </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
