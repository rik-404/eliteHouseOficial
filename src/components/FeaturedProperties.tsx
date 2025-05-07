
import React, { useState } from 'react';
import PropertyCard, { PropertyType } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for featured properties
const mockFeaturedProperties: PropertyType[] = [
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
];

const FeaturedProperties = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + itemsPerPage;
      return nextIndex >= mockFeaturedProperties.length ? 0 : nextIndex;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - itemsPerPage;
      return nextIndex < 0 ? Math.floor(mockFeaturedProperties.length / itemsPerPage) * itemsPerPage : nextIndex;
    });
  };

  const displayProperties = mockFeaturedProperties.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <section className="py-16 bg-eliteBlue">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="section-title text-eliteOrange">Imóveis em Destaque</h2>
            <p className="section-subtitle">Conheça nossas melhores ofertas disponíveis</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-eliteOrange text-eliteOrange hover:bg-eliteOrange hover:text-white"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-eliteOrange text-eliteOrange hover:bg-eliteOrange hover:text-white"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayProperties.map((property) => (
            <div key={property.id} className="animate-fade-in">
              <PropertyCard property={property} featured={true} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
