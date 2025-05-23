
import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PropertyType } from './PropertyCard';

const FeaturedProperties = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredProperties, setFeaturedProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('featured', true)
          .eq('status', true)
          .eq('vendido', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setFeaturedProperties(data);
      } catch (error) {
        console.error('Erro ao carregar imóveis em destaque:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + itemsPerPage;
      return nextIndex >= featuredProperties.length ? 0 : nextIndex;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - itemsPerPage;
      return nextIndex < 0 ? Math.floor(featuredProperties.length / itemsPerPage) * itemsPerPage : nextIndex;
    });
  };

  const displayProperties = featuredProperties.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Imóveis em Destaque</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eliteOrange"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  featured={property.featured}
                />
              ))}
            </div>
            {featuredProperties.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentIndex + itemsPerPage >= featuredProperties.length}
                >
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedProperties;
