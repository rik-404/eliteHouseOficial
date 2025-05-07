import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { neighborhoods } from '@/components/PropertySearch';

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
  };
}

const PropertyForm = ({ property }: PropertyFormProps) => {
  const navigate = useNavigate();
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
    status: property?.status || 'ativo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement form submission logic here
    // For now, just navigate back
    navigate('/admin/properties');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" className="bg-eliteOrange hover:bg-eliteOrange-light">
          {property ? 'Atualizar Imóvel' : 'Cadastrar Imóvel'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
