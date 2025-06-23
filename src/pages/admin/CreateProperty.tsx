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
  type FormData = {
    reference: string;
    title: string;
    type: string;
    location: string;
    city: string;
    uf: string;
    area: string;
    bedrooms: string;
    bathrooms: string;
    garage: string;
    price: string;
    description: string;
    image: string;
    images: string[];
    featured: boolean;
    status: boolean;  // true para ativo, false para inativo
    vendido: boolean;
  };

  const [formData, setFormData] = useState<FormData>({
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
    images: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], // Array para até 15 imagens adicionais
    featured: false,
    status: true, // true para ativo, false para inativo
    vendido: false // Não vendido por padrão
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

        // Se não houver imóveis, começa com 0000001
        if (!data || data.length === 0) {
          setFormData(prev => ({ ...prev, reference: '0000001' }));
          return;
        }

        // Pega a última referência
        const lastRef = data[0].reference;
        console.log('Última referência encontrada:', lastRef);
        
        // Extrai apenas os dígitos da referência
        const numericPart = lastRef.replace(/\D/g, '');
        // Converte para número, com fallback para 0
        const lastNumber = parseInt(numericPart) || 0;
        console.log('Número extraído:', lastNumber);
        
        // Incrementa e adiciona zeros à esquerda
        const nextNumber = (lastNumber + 1).toString().padStart(7, '0');
        console.log('Próxima referência gerada:', nextNumber);
        
        setFormData(prev => ({ ...prev, reference: nextNumber }));
      } catch (error) {
        console.error('Erro ao obter próxima referência:', error);
        setFormData(prev => ({ ...prev, reference: '0000001' }));
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
  
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const saveProperty = async (propertyData) => {
    try {
      // Filtrar apenas as URLs de imagens não vazias
      const validImages = propertyData.images.filter(img => img.trim() !== '');
      
      const { data, error } = await supabase
        .from('properties')
        .insert({
          reference: propertyData.reference,
          title: propertyData.title,
          type: propertyData.type,
          location: propertyData.location,
          city: propertyData.city,
          uf: propertyData.uf,
          area: parseInt(propertyData.area) || 0,
          bedrooms: parseInt(propertyData.bedrooms) || 0,
          bathrooms: parseInt(propertyData.bathrooms) || 0,
          garage: parseInt(propertyData.garage) || 0,
          price: parseFloat(propertyData.price) || 0,
          description: propertyData.description,
          image_url: propertyData.image, // Imagem principal
          additional_images: validImages, // Array de imagens adicionais
          featured: propertyData.featured,
          status: propertyData.status || 'ativo', // 'ativo' por padrão
          vendido: propertyData.vendido || false // Não vendido por padrão
        });

      if (error) {
        // Verificar se é um erro de conflito (409)
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('conflict')) {
          // Gerar uma nova referência e tentar novamente
          const currentRef = propertyData.reference;
          // Extrai apenas os dígitos da referência
          const numericPart = currentRef.replace(/\D/g, '');
          // Converte para número, com fallback para 0
          const currentNumber = parseInt(numericPart) || 0;
          const newNumber = (currentNumber + 1).toString().padStart(7, '0');
          
          toast({
            title: "Tentando novamente",
            description: `Referência ${currentRef} já existe. Tentando com ${newNumber}...`
          });
          
          // Atualizar o estado do formulário
          const updatedData = {
            ...propertyData,
            reference: newNumber
          };
          
          setFormData(updatedData);
          
          // Esperar um pouco antes de tentar novamente
          setTimeout(() => {
            saveProperty(updatedData);
          }, 500);
          
          return false;
        }
        
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Imóvel criado com sucesso"
      });

      navigate('/admin/properties');
      return true;
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar o imóvel",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.title || !formData.type || !formData.location) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    // Salvar diretamente - a função saveProperty já trata conflitos de referência
    await saveProperty(formData);
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
          
          <div className="admin-form-group">
            <Label htmlFor="property-image">URL da Imagem Principal</Label>
            <Input
              id="property-image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
          
          <div className="admin-form-group">
            <Label htmlFor="property-reference">Referência</Label>
            <Input
              id="property-reference"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              disabled
            />
          </div>
        </div>
        
        <div className="admin-form-group">
          <Label>Imagens Adicionais (até 15)</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {formData.images.map((image, index) => (
              <div key={index} className="space-y-1">
                <div className="flex">
                  <Input
                    placeholder={`URL da imagem ${index + 1}`}
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="text-sm"
                  />
                </div>
                {image && (
                  <div className="h-20 w-full overflow-hidden rounded border">
                    <img 
                      src={image} 
                      alt={`Prévia ${index + 1}`} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Erro+na+imagem';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
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
