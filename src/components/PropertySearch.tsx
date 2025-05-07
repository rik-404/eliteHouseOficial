
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const neighborhoods = [
  'Centro',
  'São Dimas',
  'Alemães',
  'Alto',
  'Paulista',
  'Vila Rezende',
  'Nova Piracicaba',
  'Piracicamirim',
  'Vila Independência',
  'Jardim Europa',
  'Jardim Elite',
  'Cidade Alta',
  'Paulicéia',
  'Vila Monteiro',
  'Jardim Nova América',
  'Jardim Petrópolis',
  'Santa Terezinha',
  'Vila Sônia',
  'Jardim São Paulo',
  'Dois Córregos',
  'Loteamento Santa Rosa',
  'Jardim Ipanema',
  'Jardim Parque Jupiá',
  'Jardim Abaeté',
  'Jardim Astúrias I',
  'Jardim Astúrias II',
  'Jardim Califórnia',
  'Jardim Conceição',
  'Jardim dos Sábias',
  'Jardim Esplanada',
  'Jardim Noiva da Colina',
  'Jardim Pompéia',
  'Jardim São Luiz',
  'Vila Industrial',
  'Vila Bressani',
  'Vila Pacaembu',
  'Jardim Caxambu',
  'Jardim São Francisco',
  'Jardim São Judas Tadeu',
  'Jardim Vera Cruz'
];

const PropertySearch = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('all');
  const [parking, setParking] = useState('any');
  const [bedrooms, setBedrooms] = useState('any');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Build the search params to pass to the properties page
    const searchParams = new URLSearchParams();
    if (location) searchParams.set('location', location);
    if (type !== 'all') searchParams.set('type', type);
    if (parking !== 'any') searchParams.set('parking', parking);
    if (bedrooms !== 'any') searchParams.set('bedrooms', bedrooms);
    
    navigate(`/properties?${searchParams.toString()}`);
  };
  


  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="section-title">Encontre seu Imóvel Ideal</h2>
          <p className="section-subtitle">Use nosso buscador para filtrar as melhores opções para você</p>
        </div>
        
        <div className="bg-card rounded-2xl p-6 md:p-10 shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Select
                  value={location}
                  onValueChange={setLocation}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Escolha o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map((neighborhood) => (
                      <SelectItem key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Imóvel</Label>
                <Select 
                  value={type} 
                  onValueChange={setType}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Tipo de imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="Apartamento">Apartamento</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Cobertura">Cobertura</SelectItem>
                    <SelectItem value="Terreno">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parking">Vagas na Garagem</Label>
                <Select value={parking} onValueChange={setParking}>
                  <SelectTrigger id="parking">
                    <SelectValue placeholder="Número de vagas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer número</SelectItem>
                    <SelectItem value="1">1 vaga</SelectItem>
                    <SelectItem value="2">2 vagas</SelectItem>
                    <SelectItem value="3">3 vagas</SelectItem>
                    <SelectItem value="4">4 vagas ou mais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Quartos</Label>
                <Select 
                  value={bedrooms}
                  onValueChange={setBedrooms}
                >
                  <SelectTrigger id="bedrooms">
                    <SelectValue placeholder="Número de quartos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button 
                type="submit" 
                className="bg-eliteOrange hover:bg-eliteOrange-light text-white px-8"
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar Imóveis
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PropertySearch;
