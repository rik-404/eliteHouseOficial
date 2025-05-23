
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { PropertyType } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const locations = [
  'Todos'
];

const Properties: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { toast } = useToast();
  
  // State for filters
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || 'Todos');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [minPriceFilter, setMinPriceFilter] = useState(parseInt(searchParams.get('minPrice') || '100000'));
  const [maxPriceFilter, setMaxPriceFilter] = useState(parseInt(searchParams.get('maxPrice') || '10000000'));

  
  // State for mobile filter visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // State for properties and filtered properties
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPageProperties, setCurrentPageProperties] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Carregar locais
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('location')
          .eq('status', true)
          .eq('vendido', false)
          .order('location', { ascending: true });

        if (error) throw error;
        
        if (data) {
          const uniqueLocations = ['Todos', ...new Set(data.map(property => property.location))];
          locations.splice(1, locations.length - 1, ...uniqueLocations.slice(1));
          
          // Atualizar o filtro de localização se necessário
          if (locationFilter && !uniqueLocations.includes(locationFilter)) {
            setLocationFilter('Todos');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
      }
    };

    loadLocations();
  }, []);

  // Apply filters
  const applyFilters = () => {
    const filtered = properties.filter(property => {
      const matchesLocation = locationFilter === 'Todos' || property.location === locationFilter;
      const matchesType = typeFilter === 'all' || property.type === typeFilter;
      const matchesPrice = property.price >= minPriceFilter && property.price <= maxPriceFilter;
      return matchesLocation && matchesType && matchesPrice;
    });

    setFilteredProperties(filtered);
    setTotalProperties(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

    // Atualizar os dados da página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
    setCurrentPageProperties(filtered.slice(startIndex, endIndex));

    // Resetar para a primeira página quando os filtros mudam
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [locationFilter, typeFilter, minPriceFilter, maxPriceFilter, properties]);

  // Load properties and property types from Supabase
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        console.log('Iniciando carregamento de propriedades...');
        
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('status', true)
          .eq('vendido', false)
          .order('created_at', { ascending: false });

        if (propertiesError) throw propertiesError;

        const properties = propertiesData || [];
        setProperties(properties);
        setFilteredProperties(properties);
        
        // Atualizar os dados da página atual
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, properties.length);
        setCurrentPageProperties(properties.slice(startIndex, endIndex));
        
        // Atualizar o total de páginas
        setTotalProperties(properties.length);
        setTotalPages(Math.ceil(properties.length / itemsPerPage));


      } catch (error) {
        console.error('Erro ao carregar propriedades:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar as propriedades. Por favor, tente novamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [currentPage, itemsPerPage]);

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
                  <h3 className="text-lg font-medium text-eliteOrange mb-6">Filtros</h3>
                  
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
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
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
                      <h3 className="text-lg font-medium text-orange-600">Filtros</h3>
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
                              {locations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    <div className="col-span-3 text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eliteOrange mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Carregando propriedades...</p>
                    </div>
                  ) : currentPageProperties.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-muted-foreground">Nenhuma propriedade encontrada</p>
                    </div>
                  ) : (
                    currentPageProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        featured={property.featured}
                      />
                    ))
                  )}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  {filteredProperties.length > 0 && (
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.ceil(filteredProperties.length / itemsPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`px-3 py-1 rounded ${
                            currentPage === index + 1
                              ? 'bg-eliteOrange text-white'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
