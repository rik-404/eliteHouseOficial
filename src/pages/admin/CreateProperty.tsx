import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import CustomForm from '@/components/ui/CustomForm';
import MediaManager, { MediaItem } from '@/components/admin/MediaManager';
import { useAuth } from '@/contexts/TempAuthContext';
import { PropertyFormData } from '@/types/property';
import { generatePropertyReference, getLastPropertyReference } from '@/lib/referenceGenerator';

const propertyTypes = [
  'Apartamento', 'Casa', 'Terreno', 'Sítio', 'Chácara', 'Cobertura',
  'Sala Comercial', 'Prédio Comercial', 'Galpão', 'Outro'
];

const neighborhoods = [
  'Água Branca', 'Água Santa', 'Água Seca', 'Alemães', 'Alphaville Piracicaba', 
  'Alto', 'Alto da Pompéia', 'Anhumas', 'Área Rural de Piracicaba', 'Areião', 
  'Bongue', 'Bosque dos Lenheiros', 'Campestre', 'Capim Fino', 'Castelinho', 
  'CECAP', 'Centro', 'Centro (Ártemis)', 'Centro (Ibitiruna)', 'Centro (Tupi)', 
  'Centro Comercial Agrícola Taquaral', 'Chácara Esperia', 'Chácara Nazaré', 
  'Chácara São Jorge', 'Chácaras Água Branca', 'Chicó', 'Cidade Alta', 
  'Cidade Jardim', 'Colinas do Piracicaba (Ártemis)', 'Conceição', 'Conceição II', 
  'Conjunto Habitacional Água Branca', 'Conjunto Residencial Mário Dedini', 
  'Dois Córregos', 'Estância Lago Azul (Ártemis)', 'Garças', 'Glebas Califórnia', 
  'Gran Park Residencial', 'Guamium', 'Higienópolis', 'Horto (Tupi)', 'Irmãos Camolesi', 
  'Itaperu', 'Jaraguá', 'Jardim Abaeté', 'Jardim Água Viva', 'Jardim Algodoal', 
  'Jardim Alvorada', 'Jardim Aman', 'Jardim Astúrias I', 'Jardim Astúrias II', 
  'Jardim Astúrias III', 'Jardim Bartira (Tupi)', 'Jardim Belvedere', 
  'Jardim Boa Esperança', 'Jardim Borghesi', 'Jardim Brasília', 'Jardim Califórnia', 
  'Jardim Camargo', 'Jardim Castor', 'Jardim Caxambu', 'Jardim Conceição', 
  'Jardim Costa Rica', 'Jardim Diamante', 'Jardim Dona Luisa', 'Jardim dos Antúrios', 
  'Jardim dos Manacás', 'Jardim Elite', 'Jardim Esplanada', 'Jardim Estoril', 
  'Jardim Europa', 'Jardim Flamboyant', 'Jardim Glória', 'Jardim Glória II', 
  'Jardim Ibirapuera', 'Jardim Ipanema', 'Jardim Irapuã', 'Jardim Itaiçaba (Ártemis)', 
  'Jardim Itamaracá', 'Jardim Itamaraty', 'Jardim Itapuã', 'Jardim Maria', 
  'Jardim Maria Claudia', 'Jardim Maria Helena', 'Jardim Matilde II', 'Jardim Modelo', 
  'Jardim Monumento', 'Jardim Noiva da Colina', 'Jardim Nova Iguaçu', 
  'Jardim Nova República', 'Jardim Nova Suíça', 'Jardim Oriente', 'Jardim Pacaembu', 
  'Jardim Parque Jupiá', 'Jardim Paulista', 'Jardim Petrópolis', 'Jardim Planalto', 
  'Jardim Primavera', 'Jardim Residencial Cambuy', 'Jardim Residencial Itabera', 
  'Jardim Residencial Javary I', 'Jardim Residencial Javary II', 'Jardim Residencial Javary III', 
  'Jardim Santa Ignês I', 'Jardim Santa Ignês II', 'Jardim Santa Isabel', 
  'Jardim Santa Silvia', 'Jardim São Francisco', 'Jardim São Jorge', 'Jardim São José', 
  'Jardim São Luiz', 'Jardim São Paulo', 'Jardim Sol Nascente', 'Jardim Sol Nascente II', 
  'Jardim Taiguara', 'Jardim Taiguara I', 'Jardim Taruman', 'Jardim Tatuapé', 
  'Jardim Três Marias', 'Jupiá', 'Loteamento Chácaras Nazareth II', 
  'Loteamento Distrito Industrial Uninorte', 'Loteamento Humberto Venturini', 
  'Loteamento Ipanema', 'Loteamento Irmãos Inforçato', 'Loteamento Jardim Colina Verde', 
  'Loteamento Jardim Monte Castelo', 'Loteamento Jardim Santa Maria', 
  'Loteamento Kobayat Líbano', 'Loteamento Residencial e Comercial Villa DAquila', 
  'Loteamento Residencial Gaivotas', 'Loteamento Residencial Reserva do Engenho', 
  'Loteamento Residencial Santo Antônio II', 'Loteamento Santa Rosa', 
  'Loteamento São Francisco', 'Loteamento Vem Viver Piracicaba I', 'Mário Dedini', 
  'Matão', 'Monte Alegre', 'Monte Líbano', 'Morato', 'Morumbi', 'Nhô Quim', 
  'Nossa Senhora de Fátima', 'Nova América', 'Nova Piracicaba', 'Nova Pompéia', 
  'Nova Suiça', 'Novo Horizonte', 'Ondas', 'Parque Água Branca', 'Parque Bela Vista', 
  'Parque Chapadão', 'Parque Conceição', 'Parque Conceição II', 'Parque dos Sabiás', 
  'Parque Nossa Senhora das Graças', 'Parque Orlanda I', 'Parque Orlanda II', 
  'Parque Orlanda III', 'Parque Peória (Tupi)', 'Parque Primeiro de Maio', 
  'Parque Residencial Monte Rey', 'Parque Residencial Monte Rey II', 
  'Parque Residencial Monte Rey III', 'Parque Residencial Piracicaba', 
  'Parque Residencial Piracicaba Balbo', 'Parque Santa Cecília', 'Parque São Jorge', 
  'Parque São Matheus', 'Parque Taquaral', 'Pau DAlhinho', 'Pau Queimado', 
  'Paulicéia', 'Paulista', 'Perdizes', 'Piracicamirim', 'Pompéia', 'Prezoto', 
  'Residencial Alto da Boa Vista', 'Residencial Altos do Piracicaba', 
  'Residencial Andorinhas', 'Residencial Bela Vista', 'Residencial Bertolucci', 
  'Residencial Itaporanga', 'Residencial Mont Carlo', 'Residencial Nova Água Branca II', 
  'Residencial Paineiras', 'Residencial Portal da Água Branca', 'Residencial Santo Antônio', 
  'Residencial Serra Verde', 'Residencial Terras de Ártemis (Ártemis)', 'Santa Olímpia', 
  'Santa Rita', 'Santa Rosa', 'Santa Rosa Ipês', 'Santa Terezinha', 'Santana', 
  'São Dimas', 'São Jorge', 'São Judas', 'São Luiz', 'Sertãozinho', 'Tanquinho (Guamium)', 
  'Taquaral', 'Terra Nova', 'Terras de Piracicaba', 'Terras do Engenho', 'Unileste', 
  'Vale do Sol', 'Verde', 'Vila Belém', 'Vila Bessy', 'Vila Cristina', 'Vila Fátima', 
  'Vila Independência', 'Vila Industrial', 'Vila Monteiro', 'Vila Nossa Senhora Aparecida', 
  'Vila Nova', 'Vila Pacaembu', 'Vila Rezende', 'Vila Sônia', 'Vivendas Bela Vista'
];

const initialFormData: PropertyFormData = {
  title: '', 
  type: '', 
  reference: '', 
  location: '',
  city: 'Piracicaba', 
  uf: 'SP', 
  area: '', 
  bedrooms: '',
  bathrooms: '', 
  garage: '', 
  price: '', 
  description: '',
  featured: false, 
  status: true, 
  vendido: false,
  broker_id: null
};

const CreateProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<PropertyFormData>({
    ...initialFormData,
    // Inicializa com uma referência vazia, vamos gerar automaticamente
    reference: ''
  });
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [mainImage, setMainImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingReference, setIsGeneratingReference] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Se for o campo de referência, permite apenas números
    if (name === 'reference') {
      // Remove qualquer caractere que não seja número
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Efeito para gerar a referência automaticamente ao montar o componente
  React.useEffect(() => {
    const generateInitialReference = async () => {
      try {
        setIsGeneratingReference(true);
        const lastReference = await getLastPropertyReference();
        const newReference = generatePropertyReference(lastReference || undefined);
        
        setFormData(prev => ({
          ...prev,
          reference: newReference
        }));
      } catch (error) {
        console.error('Erro ao gerar referência inicial:', error);
        toast({
          title: "Aviso",
          description: "Não foi possível gerar a referência automaticamente. Clique em 'Gerar' para tentar novamente.",
          variant: "destructive"
        });
      } finally {
        setIsGeneratingReference(false);
      }
    };

    generateInitialReference();
  }, []);

  const handleMediaChange = (medias: MediaItem[], mainImageUrl: string) => {
    console.log('Mídias alteradas:', medias);
    console.log('Imagem principal:', mainImageUrl);
    setMediaFiles(medias);
    setMainImage(mainImageUrl);
  };

  // Gera uma referência automática para o imóvel
  const generateReference = async () => {
    try {
      setIsGeneratingReference(true);
      const lastReference = await getLastPropertyReference();
      const newReference = generatePropertyReference(lastReference || undefined);
      
      setFormData(prev => ({
        ...prev,
        reference: newReference
      }));
      
      return newReference;
    } catch (error) {
      console.error('Erro ao gerar referência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a referência automática. Por favor, tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGeneratingReference(false);
    }
  };

  // Verifica se a referência já foi gerada, se não, gera uma nova
  const ensureReference = async () => {
    if (!formData.reference) {
      return await generateReference();
    }
    return formData.reference;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Iniciando envio do formulário...');
    console.log('Dados do formulário:', formData);
    console.log('Mídias:', mediaFiles);
    console.log('Imagem principal:', mainImage);
    
    // Verifica se já tem referência, se não, gera uma
    const reference = await ensureReference();
    if (!reference) {
      console.error('Não foi possível gerar a referência');
      return;
    }
    
    if (!formData.title || !formData.type || !formData.location) {
      const errorMsg = 'Preencha todos os campos obrigatórios';
      console.error('Erro de validação:', errorMsg);
      toast({
        title: "Campos obrigatórios",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    if (mediaFiles.length === 0) {
      const errorMsg = 'Adicione pelo menos uma imagem do imóvel';
      console.error('Erro de validação:', errorMsg);
      toast({
        title: "Imagem obrigatória",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Preparando dados para envio...');
      
      // Mapear as mídias para o formato esperado
      const additionalMedia = mediaFiles
        .filter(media => media.url !== mainImage)
        .map(media => {
          console.log('Processando mídia:', media);
          return {
            url: media.url,
            type: media.type,
            ...(media.thumbnail && { thumbnail: media.thumbnail })
          };
        });
      
      console.log('Mídias adicionais processadas:', additionalMedia);
      
      const propertyData = {
        ...formData,
        image_url: mainImage,
        additional_media: additionalMedia,
        area: parseInt(formData.area) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        garage: parseInt(formData.garage) || 0,
        price: parseFloat(formData.price) || 0,
        status: formData.vendido ? false : formData.status,
        broker_id: user?.broker_id || null,
        created_at: new Date().toISOString()
      };
      
      console.log('Dados do imóvel para inserção:', propertyData);

      console.log('Enviando dados para o Supabase...');
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select();

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Erro ao inserir no Supabase:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Imóvel cadastrado com sucesso!"
      });

      navigate('/admin/properties');
    } catch (error) {
      console.error('Erro ao cadastrar imóvel:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o imóvel. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render do formulário
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cadastrar Novo Imóvel</h1>
      
      <CustomForm onSubmit={handleSubmit} className="space-y-6">
        {/* Seção de Informações Básicas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="title">Título *</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="featured" className="text-sm font-medium">
                    Destacar este imóvel
                  </Label>
                </div>
              </div>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="reference">Referência</Label>
                {isGeneratingReference && (
                  <span className="text-xs text-gray-500">Gerando referência...</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Gerando referência..."
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={generateReference}
                  disabled={isGeneratingReference}
                  variant="outline"
                  title="Gerar nova referência"
                >
                  ↻
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Bairro *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleSelectChange('location', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o bairro" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Input
                id="uf"
                name="uf"
                value={formData.uf}
                readOnly
                className="w-16"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área (m²)</Label>
              <Input
                id="area"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Banheiros</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="garage">Vagas de Garagem</Label>
              <Input
                id="garage"
                name="garage"
                type="number"
                value={formData.garage}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
        </div>

        {/* Seção de Mídias */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mídias do Imóvel</h2>
          <MediaManager
            initialMedias={[]}
            mainImageUrl={mainImage}
            onChange={handleMediaChange}
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/properties')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Imóvel'}
          </Button>
        </div>
      </CustomForm>
    </div>
  );
};

export default CreateProperty;
