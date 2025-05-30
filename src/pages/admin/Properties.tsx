import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/TempAuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

export const Properties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>(['Todos']);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendidoFilter, setVendidoFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Carregar imóveis e localizações únicas do Supabase
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const propertiesData = data || [];
        setProperties(propertiesData);
      

        // Extrair localizações únicas
        const locationsSet = new Set<string>(propertiesData.map(property => property.location));
        const locationsArray = ['Todos', ...Array.from(locationsSet)];
        setUniqueLocations(locationsArray);
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
    
    // Configurar escuta em tempo real para a tabela de propriedades
    const channel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
        },
        (payload) => {
          console.log('Mudança detectada na tabela properties:', payload);
          loadProperties(); // Atualiza a lista de propriedades automaticamente
        }
      )
      .subscribe();

    // Limpar a escuta quando o componente for desmontado
    return () => {
      channel.unsubscribe();
    };
  }, [toast]);

  const handleToggleStatus = async (id: string, status: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Atualizar a lista local
      setProperties(properties.map(property => {
        if (property.id === id) {
          return { ...property, status };
        }
        return property;
      }));

      toast({
        title: "Sucesso",
        description: `Status do imóvel alterado para ${status ? 'ativo' : 'inativo'}`
      });
    } catch (error) {
      console.error('Erro ao alterar status do imóvel:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status do imóvel",
        variant: "destructive"
      });
    }
  };

  const handleToggleVendido = async (id: string, vendido: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ vendido })
        .eq('id', id);

      if (error) throw error;

      // Atualizar a lista local
      setProperties(properties.map(property => {
        if (property.id === id) {
          return { ...property, vendido };
        }
        return property;
      }));

      toast({
        title: "Sucesso",
        description: `Imóvel marcado como ${vendido ? 'vendido' : 'disponível'}`
      });
    } catch (error) {
      console.error('Erro ao alterar situação do imóvel:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar a situação do imóvel",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    setPropertyToDelete({
      id,
      title: property.title
    });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete.id);

      if (error) throw error;

      // Atualizar lista local
      setProperties(properties.filter(property => property.id !== propertyToDelete.id));
      setPropertyToDelete(null);
      
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
    // Se não houver nenhum filtro ativo, mostra todos os imóveis
    if (!searchTerm && (locationFilter === 'Todos' || !locationFilter) && typeFilter === 'all' && statusFilter === 'all') {
      return true;
    }

    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'Todos' || 
                          property.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || property.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && property.status === true) || 
                         (statusFilter === 'inactive' && property.status === false);
                         
    const matchesVendido = vendidoFilter === 'all' ||
                         (vendidoFilter === 'vendido' && property.vendido === true) ||
                         (vendidoFilter === 'disponivel' && property.vendido === false);
    
    return matchesSearch && matchesLocation && matchesType && matchesStatus && matchesVendido;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Imóveis</h2>
        <Button 
          onClick={() => navigate('/admin/properties/new')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar por título ou referência</Label>
            <Input
              id="search"
              placeholder="Buscar por título ou referência"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="location">Localização</Label>
            <Select
              value={locationFilter}
              onValueChange={(value) => setLocationFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por localização" />
              </SelectTrigger>
              <SelectContent>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="vendido">Situação</Label>
            <Select
              value={vendidoFilter}
              onValueChange={(value) => setVendidoFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="disponivel">Disponíveis</SelectItem>
                <SelectItem value="vendido">Vendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto p-4 md:p-6 relative">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/12">Referência</TableHead>
                <TableHead className="w-1/6">Título</TableHead>
                <TableHead className="w-1/12">Tipo</TableHead>
                <TableHead className="w-1/6">Localização</TableHead>
                <TableHead className="w-1/12">Área (m²)</TableHead>
                <TableHead className="w-1/12">Quartos</TableHead>
                <TableHead className="w-1/12">Banheiros</TableHead>
                <TableHead className="w-1/12">Garagem</TableHead>
                <TableHead className="w-1/12">Preço</TableHead>
                <TableHead className="w-1/12">Destaque</TableHead>
                <TableHead className="w-1/12">Status</TableHead>
                <TableHead className="w-1/12">Situação</TableHead>
                <TableHead className="w-1/12">Ações</TableHead>
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
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <Switch
                          checked={property.status}
                          onCheckedChange={(checked) => handleToggleStatus(property.id, checked)}
                          className={`${property.status ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        property.vendido ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {property.vendido ? 'Vendido' : 'Disponível'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          size="sm"
                          onClick={() => handleEdit(property.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user?.role !== 'corretor' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};


