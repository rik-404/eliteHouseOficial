
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard, { PropertyType } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, Search } from 'lucide-react';

// Mock data for properties
const mockProperties: PropertyType[] = [
  {
    id: 1,
    title: 'Apartamento de Luxo com Vista para o Mar',
    price: 1850000,
    address: 'Av. Atlântica, 1500',
    city: 'Rio de Janeiro',
    state: 'RJ',
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Apartamento',
    featured: true
  },
  {
    id: 2,
    title: 'Casa de Campo com Piscina e Área Gourmet',
    price: 2200000,
    address: 'Estrada do Rio Grande, 3000',
    city: 'Gramado',
    state: 'RS',
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1475&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Casa',
    featured: true
  },
  {
    id: 3,
    title: 'Cobertura Duplex em Alto Padrão',
    price: 3700000,
    address: 'Av. Paulista, 2000',
    city: 'São Paulo',
    state: 'SP',
    bedrooms: 4,
    bathrooms: 5,
    area: 420,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Cobertura',
    featured: true
  },
  {
    id: 4,
    title: 'Apartamento Garden com Amplo Espaço de Lazer',
    price: 1350000,
    address: 'Rua Prof. Pedro Viriato, 500',
    city: 'Curitiba',
    state: 'PR',
    bedrooms: 3,
    bathrooms: 2,
    area: 156,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Apartamento',
    featured: true
  },
  {
    id: 5,
    title: 'Casa em Condomínio Fechado com Segurança 24h',
    price: 2800000,
    address: 'Alameda das Flores, 150',
    city: 'Campinas',
    state: 'SP',
    bedrooms: 4,
    bathrooms: 4,
    area: 380,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Casa',
    featured: true
  },
  {
    id: 6,
    title: 'Terreno em Condomínio de Luxo',
    price: 950000,
    address: 'Rua das Palmeiras, 350',
    city: 'Florianópolis',
    state: 'SC',
    bedrooms: 0,
    bathrooms: 0,
    area: 500,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    type: 'Terreno'
  },
];

const cities = [
  'Todos',
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Brasília, DF',
  'Salvador, BA',
  'Fortaleza, CE',
  'Curitiba, PR',
  'Porto Alegre, RS',
  'Recife, PE',
  'Florianópolis, SC',
  'Campinas, SP',
  'Gramado, RS'
];

const Properties = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // State for filters
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [minPriceFilter, setMinPriceFilter] = useState(parseInt(searchParams.get('minPrice') || '100000'));
  const [maxPriceFilter, setMaxPriceFilter] = useState(parseInt(searchParams.get('maxPrice') || '10000000'));
  const [bedroomsFilter, setBedroomsFilter] = useState(searchParams.get('bedrooms') || 'any');
  
  // State for mobile filter visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // State for filtered properties and pagination
  const [filteredProperties, setFilteredProperties] = useState<PropertyType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Apply filters
  useEffect(() => {
    let filtered = [...mockProperties];
    
    if (locationFilter && locationFilter !== 'Todos') {
      const [city, state] = locationFilter.split(', ');
      filtered = filtered.filter(property => property.city === city && property.state === state);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(property => property.type === typeFilter);
    }
    
    filtered = filtered.filter(property => 
      property.price >= minPriceFilter && property.price <= maxPriceFilter
    );
    
    if (bedroomsFilter !== 'any') {
      const minBedrooms = parseInt(bedroomsFilter);
      filtered = filtered.filter(property => property.bedrooms >= minBedrooms);
    }
    
    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [locationFilter, typeFilter, minPriceFilter, maxPriceFilter, bedroomsFilter]);
  
  // Get current page properties
  const indexOfLastProperty = currentPage * itemsPerPage;
  const indexOfFirstProperty = indexOfLastProperty - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-eliteBlue">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-eliteBlue-light py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Encontre o Imóvel Perfeito
            </h1>
            <p className="text-xl text-white/80">
              Conheça todas as nossas opções disponíveis
            </p>
          </div>
        </div>
        
        {/* Properties Section */}
        <section className="py-12">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Filters - Desktop */}
              <div className="hidden md:block w-64 shrink-0">
                <div className="bg-card p-6 rounded-lg sticky top-24">
                  <h3 className="text-lg font-medium text-white mb-6">Filtros</h3>
                  
                  <form onSubmit={handleApplyFilters}>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="location-desktop">Localização</Label>
                        <Select 
                          value={locationFilter} 
                          onValueChange={setLocationFilter}
                        >
                          <SelectTrigger id="location-desktop">
                            <SelectValue placeholder="Escolha a localização" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type-desktop">Tipo de Imóvel</Label>
                        <Select 
                          value={typeFilter} 
                          onValueChange={setTypeFilter}
                        >
                          <SelectTrigger id="type-desktop">
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
                        <Label>Faixa de Preço</Label>
                        <div className="pt-4">
                          <Slider 
                            value={[minPriceFilter, maxPriceFilter]}
                            min={100000}
                            max={10000000}
                            step={50000}
                            onValueChange={(values) => {
                              setMinPriceFilter(values[0]);
                              setMaxPriceFilter(values[1]);
                            }}
                          />
                          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                            <span>{formatCurrency(minPriceFilter)}</span>
                            <span>{formatCurrency(maxPriceFilter)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms-desktop">Quartos</Label>
                        <Select 
                          value={bedroomsFilter}
                          onValueChange={setBedroomsFilter}
                        >
                          <SelectTrigger id="bedrooms-desktop">
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
                  </form>
                </div>
              </div>
              
              {/* Properties List */}
              <div className="flex-grow">
                {/* Filter toggle for mobile */}
                <div className="flex justify-between items-center mb-6 md:hidden">
                  <Button 
                    variant="outline"
                    className="border-eliteOrange text-eliteOrange"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter size={16} className="mr-2" />
                    Filtrar
                  </Button>
                  
                  <span className="text-muted-foreground">
                    {filteredProperties.length} imóveis encontrados
                  </span>
                </div>
                
                {/* Mobile Filters */}
                {showFilters && (
                  <div className="md:hidden mb-6 bg-card p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-white">Filtros</h3>
                      <button 
                        className="text-muted-foreground"
                        onClick={() => setShowFilters(false)}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <form onSubmit={handleApplyFilters}>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="location-mobile">Localização</Label>
                          <Select 
                            value={locationFilter} 
                            onValueChange={setLocationFilter}
                          >
                            <SelectTrigger id="location-mobile">
                              <SelectValue placeholder="Escolha a localização" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="type-mobile">Tipo de Imóvel</Label>
                          <Select 
                            value={typeFilter} 
                            onValueChange={setTypeFilter}
                          >
                            <SelectTrigger id="type-mobile">
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
                          <Label>Faixa de Preço</Label>
                          <div className="pt-4">
                            <Slider 
                              value={[minPriceFilter, maxPriceFilter]}
                              min={100000}
                              max={10000000}
                              step={50000}
                              onValueChange={(values) => {
                                setMinPriceFilter(values[0]);
                                setMaxPriceFilter(values[1]);
                              }}
                            />
                            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                              <span>{formatCurrency(minPriceFilter)}</span>
                              <span>{formatCurrency(maxPriceFilter)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bedrooms-mobile">Quartos</Label>
                          <Select 
                            value={bedroomsFilter}
                            onValueChange={setBedroomsFilter}
                          >
                            <SelectTrigger id="bedrooms-mobile">
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
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-eliteOrange hover:bg-eliteOrange-light text-white"
                        >
                          Aplicar Filtros
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Results count and sorting */}
                <div className="hidden md:flex justify-between items-center mb-6">
                  <span className="text-muted-foreground">
                    {filteredProperties.length} imóveis encontrados
                  </span>
                </div>
                
                {/* Properties Grid */}
                {currentProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-xl text-white mb-2">Nenhum imóvel encontrado</h3>
                    <p className="text-muted-foreground">Tente ajustar seus filtros de busca</p>
                  </div>
                )}
                
                {/* Pagination */}
                {filteredProperties.length > itemsPerPage && (
                  <div className="flex justify-center mt-10">
                    <div className="join">
                      {Array.from({ length: Math.ceil(filteredProperties.length / itemsPerPage) }).map((_, index) => (
                        <Button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          variant={currentPage === index + 1 ? 'default' : 'outline'}
                          className={`mx-1 ${
                            currentPage === index + 1 
                              ? 'bg-eliteOrange hover:bg-eliteOrange-light text-white' 
                              : 'border-muted text-white hover:bg-eliteBlue-light'
                          }`}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Properties;
