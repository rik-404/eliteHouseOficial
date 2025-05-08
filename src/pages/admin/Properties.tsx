import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Properties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Carregar imóveis do Supabase
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os imóveis",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [toast]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualizar lista local
      setProperties(properties.filter(property => property.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Imóvel removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover imóvel:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o imóvel",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (id: number) => {
    // Navigate to edit page
    navigate(`/admin/properties/${id}/edit`);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        property.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Imóveis</h2>
        <Button onClick={() => navigate('/admin/properties/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Imóvel
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Buscar por referência, título ou localização"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referência</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Área (m²)</TableHead>
              <TableHead>Quartos</TableHead>
              <TableHead>Banheiros</TableHead>
              <TableHead>Garagem</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Destaque</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  Carregando imóveis...
                </TableCell>
              </TableRow>
            ) : filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  Nenhum imóvel encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.reference}</TableCell>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.area}</TableCell>
                  <TableCell>{property.bedrooms}</TableCell>
                  <TableCell>{property.bathrooms}</TableCell>
                  <TableCell>{property.garage}</TableCell>
                  <TableCell>R$ {property.price.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      property.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.featured ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-[rgb(234,179,8)] hover:bg-[rgb(244,209,18)] text-white"
                      onClick={() => handleEdit(property.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Properties;
