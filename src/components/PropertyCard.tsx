
import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, ArrowRight, MapPin, Square, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type PropertyType = {
  id: number;
  reference: string;
  title: string;
  price: number;
  location: string;
  city: string;
  uf: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  garage?: number;
  image_url: string;
  type: 'Apartamento' | 'Casa' | 'Cobertura' | 'Terreno';
  featured?: boolean;
};

interface PropertyCardProps {
  property: PropertyType;
  featured?: boolean;
}

const PropertyCard = ({ property, featured = false }: PropertyCardProps) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div className={`property-card group ${featured ? 'h-full' : ''}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden h-[200px]">
        {/* Property Image */}
        <img 
          src={property.image_url} 
          alt={property.title} 
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        
        {/* Property Type Badge */}
        <Badge 
          className="absolute top-4 left-4 bg-eliteOrange hover:bg-eliteOrange text-white"
        >
          {property.type}
        </Badge>
        
        {/* Featured Badge */}
        {featured && (
          <Badge 
            className="absolute top-4 right-4 bg-white/80 text-eliteBlue hover:bg-white"
          >
            Destaque
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-black mb-2 line-clamp-1">{property.title}</h3>
          <span className="text-eliteOrange font-bold">{formattedPrice}</span>
        </div>
        
        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin size={14} className="mr-1" />
          <span className="text-sm truncate">{property.location}, {property.city}/{property.uf}</span>
        </div>
        
        <div className="flex justify-between mb-4 text-sm">
          <div className="flex items-center">
            <Bed size={16} className="text-eliteOrange mr-1" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</span>
          </div>
          <div className="flex items-center">
            <Bath size={16} className="text-eliteOrange mr-1" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}</span>
          </div>
          <div className="flex items-center">
            <Square size={16} className="text-eliteOrange mr-1" />
            <span>{property.area} m²</span>
          </div>
          <div className="flex items-center">
            <Car size={16} className="text-eliteOrange mr-1" />
            <span>{property.garage || 0} {property.garage === 1 ? 'Vaga' : 'Vagas'}</span>
          </div>
        </div>
        
        <Link to={`/property/${property.id}`}>
          <Button 
            variant="outline" 
            className="w-full border-eliteOrange text-eliteOrange hover:bg-eliteOrange hover:text-white group"
          >
            Ver Detalhes
            <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
