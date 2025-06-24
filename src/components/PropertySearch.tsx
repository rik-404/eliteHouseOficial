
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import CustomForm from '@/components/ui/CustomForm';

const PropertySearch = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('all');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(['Todos os Tipos']);

  useEffect(() => {
    const loadNeighborhoods = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('location')
          .eq('status', true)
          .eq('vendido', false)
          .order('location', { ascending: true});

        if (error) throw error;
        
        if (data) {
          const uniqueNeighborhoods = [...new Set(data.map(property => property.location))];
          setNeighborhoods(['Todos', ...uniqueNeighborhoods]);
        }
      } catch (error) {
        console.error('Erro ao carregar bairros:', error);
      }
    };

    const loadPropertyTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('type')
          .eq('status', true)
          .eq('vendido', false)
          .order('type', { ascending: true});

        if (error) throw error;
        
        if (data) {
          const uniqueTypes = [...new Set(data.map(property => property.type))];
          setPropertyTypes(['Todos os Tipos', ...uniqueTypes]);
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de imóveis:', error);
      }
    };

    loadNeighborhoods();
    loadPropertyTypes();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Build the search params to pass to the properties page
    const searchParams = new URLSearchParams();
    if (location) searchParams.set('location', location);
    if (type !== 'all') searchParams.set('type', type);
    
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
          <CustomForm onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type === 'Todos os Tipos' ? 'all' : type}>
                        {type}
                      </SelectItem>
                    ))}
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
          </CustomForm>
        </div>
      </div>
    </section>
  );
};

export default PropertySearch;
