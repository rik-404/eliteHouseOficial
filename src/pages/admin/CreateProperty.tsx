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

const locations = [
  'Água Branca',
  'Água Santa',
  'Água Seca',
  'Alemães',
  'Alphaville Piracicaba',
  'Alto',
  'Alto da Pompéia',
  'Anhumas',
  'Área Rural de Piracicaba',
  'Areião',
  'Bongue',
  'Bosque dos Lenheiros',
  'Campestre',
  'Capim Fino',
  'Castelinho',
  'CECAP',
  'Centro',
  'Centro (Ártemis)',
  'Centro (Ibitiruna)',
  'Centro (Tupi)',
  'Centro Comercial Agrícola Taquaral',
  'Chácara Esperia',
  'Chácara Nazaré',
  'Chácara São Jorge',
  'Chácaras Água Branca',
  'Chicó',
  'Cidade Alta',
  'Cidade Jardim',
  'Colinas do Piracicaba (Ártemis)',
  'Conceição',
  'Conceição II',
  'Conjunto Habitacional Água Branca',
  'Conjunto Residencial Mário Dedini',
  'Dois Córregos',
  'Estância Lago Azul (Ártemis)',
  'Garças',
  'Glebas Califórnia',
  'Gran Park Residencial',
  'Guamium',
  'Higienópolis',
  'Horto (Tupi)',
  'Irmãos Camolesi',
  'Itaperu',
  'Jaraguá',
  'Jardim Abaeté',
  'Jardim Água Viva',
  'Jardim Algodoal',
  'Jardim Alvorada',
  'Jardim Aman',
  'Jardim Astúrias I',
  'Jardim Astúrias II',
  'Jardim Astúrias III',
  'Jardim Bartira (Tupi)',
  'Jardim Belvedere',
  'Jardim Boa Esperança',
  'Jardim Borghesi',
  'Jardim Brasília',
  'Jardim Califórnia',
  'Jardim Camargo',
  'Jardim Castor',
  'Jardim Caxambu',
  'Jardim Conceição',
  'Jardim Costa Rica',
  'Jardim Diamante',
  'Jardim Dona Luisa',
  'Jardim dos Antúrios',
  'Jardim dos Manacás',
  'Jardim Elite',
  'Jardim Esplanada',
  'Jardim Estoril',
  'Jardim Europa',
  'Jardim Flamboyant',
  'Jardim Glória',
  'Jardim Glória II',
  'Jardim Ibirapuera',
  'Jardim Ipanema',
  'Jardim Irapuã',
  'Jardim Itaiçaba (Ártemis)',
  'Jardim Itamaracá',
  'Jardim Itamaraty',
  'Jardim Itapuã',
  'Jardim Maria',
  'Jardim Maria Claudia',
  'Jardim Maria Helena',
  'Jardim Matilde II',
  'Jardim Modelo',
  'Jardim Monumento',
  'Jardim Noiva da Colina',
  'Jardim Nova Iguaçu',
  'Jardim Nova República',
  'Jardim Nova Suíça',
  'Jardim Oriente',
  'Jardim Pacaembu',
  'Jardim Parque Jupiá',
  'Jardim Paulista',
  'Jardim Petrópolis',
  'Jardim Planalto',
  'Jardim Primavera',
  'Jardim Residencial Cambuy',
  'Jardim Residencial Itabera',
  'Jardim Residencial Javary I',
  'Jardim Residencial Javary II',
  'Jardim Residencial Javary III',
  'Jardim Santa Ignês I',
  'Jardim Santa Ignês II',
  'Jardim Santa Isabel',
  'Jardim Santa Silvia',
  'Jardim São Francisco',
  'Jardim São Jorge',
  'Jardim São José',
  'Jardim São Luiz',
  'Jardim São Paulo',
  'Jardim Sol Nascente',
  'Jardim Sol Nascente II',
  'Jardim Taiguara',
  'Jardim Taiguara I',
  'Jardim Taruman',
  'Jardim Tatuapé',
  'Jardim Três Marias',
  'Jupiá',
  'Loteamento Chácaras Nazareth II',
  'Loteamento Distrito Industrial Uninorte',
  'Loteamento Humberto Venturini',
  'Loteamento Ipanema',
  'Loteamento Irmãos Inforçato',
  'Loteamento Jardim Colina Verde',
  'Loteamento Jardim Monte Castelo',
  'Loteamento Jardim Santa Maria',
  'Loteamento Kobayat Líbano',
  'Loteamento Residencial e Comercial Villa DAquila',
  'Loteamento Residencial Gaivotas',
  'Loteamento Residencial Reserva do Engenho',
  'Loteamento Residencial Santo Antônio II',
  'Loteamento Santa Rosa',
  'Loteamento São Francisco',
  'Loteamento Vem Viver Piracicaba I',
  'Mário Dedini',
  'Matão',
  'Monte Alegre',
  'Monte Líbano',
  'Morato',
  'Morumbi',
  'Nhô Quim',
  'Nossa Senhora de Fátima',
  'Nova América',
  'Nova Piracicaba',
  'Nova Pompéia',
  'Nova Suiça',
  'Novo Horizonte',
  'Ondas',
  'Parque Água Branca',
  'Parque Bela Vista',
  'Parque Chapadão',
  'Parque Conceição',
  'Parque Conceição II',
  'Parque dos Sabiás',
  'Parque Nossa Senhora das Graças',
  'Parque Orlanda I',
  'Parque Orlanda II',
  'Parque Orlanda III',
  'Parque Peória (Tupi)',
  'Parque Primeiro de Maio',
  'Parque Residencial Monte Rey',
  'Parque Residencial Monte Rey II',
  'Parque Residencial Monte Rey III',
  'Parque Residencial Piracicaba',
  'Parque Residencial Piracicaba Balbo',
  'Parque Santa Cecília',
  'Parque São Jorge',
  'Parque São Matheus',
  'Parque Taquaral',
  'Pau DAlhinho',
  'Pau Queimado',
  'Paulicéia',
  'Paulista',
  'Perdizes',
  'Piracicamirim',
  'Pompéia',
  'Prezoto',
  'Residencial Alto da Boa Vista',
  'Residencial Altos do Piracicaba',
  'Residencial Andorinhas',
  'Residencial Bela Vista',
  'Residencial Bertolucci',
  'Residencial Itaporanga',
  'Residencial Mont Carlo',
  'Residencial Nova Água Branca II',
  'Residencial Paineiras',
  'Residencial Portal da Água Branca',
  'Residencial Santo Antônio',
  'Residencial Serra Verde',
  'Residencial Terras de Ártemis (Ártemis)',
  'Santa Olímpia',
  'Santa Rita',
  'Santa Rosa',
  'Santa Rosa Ipês',
  'Santa Terezinha',
  'Santana',
  'São Dimas',
  'São Jorge',
  'São Judas',
  'São Luiz',
  'Sertãozinho',
  'Tanquinho (Guamium)',
  'Taquaral',
  'Terra Nova',
  'Terras de Piracicaba',
  'Terras do Engenho',
  'Unileste',
  'Vale do Sol',
  'Verde',
  'Vila Belém',
  'Vila Bessy',
  'Vila Cristina',
  'Vila Fátima',
  'Vila Independência',
  'Vila Industrial',
  'Vila Monteiro',
  'Vila Nossa Senhora Aparecida',
  'Vila Nova',
  'Vila Pacaembu',
  'Vila Rezende',
  'Vila Sônia',
  'Vivendas Bela Vista'
];

const CreateProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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
      .maybeSingle();

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
        description: "Esta referência já está em uso",
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Novo Imóvel</h2>
        <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/admin/properties')}>
          Voltar
        </Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
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
            <div className="relative">
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a localização" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="admin-form-group">
            <Label htmlFor="property-city">Cidade</Label>
            <Input
              id="property-city"
              name="city"
              value={formData.city}
              readOnly
              required
            />
          </div>
          <div className="admin-form-group">
            <Label htmlFor="property-uf">UF</Label>
            <Input
              id="property-uf"
              name="uf"
              value={formData.uf}
              readOnly
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

        <div className="flex justify-end" style={{ marginTop: '20px' }}>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Salvar
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProperty;
