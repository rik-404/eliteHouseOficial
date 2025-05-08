import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const CreateProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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
    image: '',
    featured: false
  });

  // Carregar a próxima referência quando o componente é montado
  useEffect(() => {
    const loadNextReference = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('reference')
          .order('reference', { ascending: false })
          .limit(1);

        if (error) throw error;

        // Se não houver imóveis, começa com 0000000
        if (!data || data.length === 0) {
          setFormData(prev => ({ ...prev, reference: '0000000' }));
          return;
        }

        // Pega a última referência
        const lastRef = data[0].reference;
        // Remove os zeros à esquerda e converte para número
        const lastNumber = parseInt(lastRef.replace(/^0+/, ''));
        // Incrementa e adiciona zeros à esquerda
        const nextNumber = (lastNumber + 1).toString().padStart(7, '0');
        
        setFormData(prev => ({ ...prev, reference: nextNumber }));
      } catch (error) {
        console.error('Erro ao obter próxima referência:', error);
        setFormData(prev => ({ ...prev, reference: '0000000' }));
      }
    };
    loadNextReference();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se a referência já existe
    const { data: existing, error: existsError } = await supabase
      .from('properties')
      .select('id')
      .eq('reference', formData.reference)
      .single();

    if (existsError) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar a referência",
        variant: "destructive"
      });
      return;
    }

    if (existing) {
      toast({
        title: "Erro",
        description: "Esta referência já existe",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          reference: formData.reference,
          title: formData.title,
          type: formData.type,
          location: formData.location,
          city: formData.city,
          uf: formData.uf,
          area: parseInt(formData.area),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          garage: parseInt(formData.garage),
          price: parseFloat(formData.price),
          description: formData.description,
          image_url: formData.image,
          featured: formData.featured
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Imóvel criado com sucesso"
      });

      navigate('/admin/properties');
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar o imóvel",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Novo Imóvel</h2>
      <form onSubmit={handleSubmit} id="property-form" className="space-y-6">
        <input type="hidden" id="property-id" value="" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="admin-form-group">
            <Label htmlFor="property-title">Título</Label>
            <Input
              id="property-title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="admin-form-group">
            <Label htmlFor="property-type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="admin-form-group">
            <Label htmlFor="property-location">Localização</Label>
            <Input
              id="property-location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="admin-form-group">
            <Label htmlFor="property-city">Cidade</Label>
            <Input
              id="property-city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="admin-form-group">
            <Label htmlFor="property-uf">UF</Label>
            <Input
              id="property-uf"
              name="uf"
              value={formData.uf}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-form-group">
            <Label htmlFor="property-area">Área (m²)</Label>
            <Input
              id="property-area"
              name="area"
              type="number"
              value={formData.area}
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
              value={formData.bedrooms}
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
              value={formData.bathrooms}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="admin-form-group">
            <Label htmlFor="property-garage">Vagas de Garagem</Label>
            <Input
              id="property-garage"
              name="garage"
              type="number"
              value={formData.garage}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="admin-form-group">
          <Label htmlFor="property-price">Preço (R$)</Label>
          <Input
            id="property-price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="admin-form-group">
          <Label htmlFor="property-description">Descrição</Label>
          <Textarea
            id="property-description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="admin-form-group">
          <Label htmlFor="property-image">Imagem (URL)</Label>
          <Input
            id="property-image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            required
          />
          {formData.image && (
            <div className="mt-2">
              <img
                src={formData.image}
                alt="Preview"
                className="max-w-full h-auto rounded"
              />
            </div>
          )}
        </div>

        <div className="admin-form-group" id="featured-checkbox-container" style={{ display: 'block' }}>
          <Label>
            <Input
              type="checkbox"
              id="property-featured"
              name="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
            />
            Destacar na página inicial
          </Label>
        </div>

        <div className="flex justify-end gap-4" style={{ marginTop: '20px' }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/properties')}
            className="admin-button secondary"
            id="cancel-property-btn"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="admin-button add bg-eliteOrange hover:bg-eliteOrange-light"
          >
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProperty;
