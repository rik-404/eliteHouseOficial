import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockProperties = [
      {
        id: 1,
        title: 'Apartamento no Centro',
        location: 'Centro',
        type: 'Apartamento',
        bedrooms: 3,
        bathrooms: 2,
        price: 500000,
        status: 'ativo',
        createdAt: new Date().toISOString()
      },
      // Add more mock properties as needed
    ];
    setProperties(mockProperties);
  }, []);

  const handleDelete = (id: number) => {
    // Implement delete logic
    setProperties(properties.filter(property => property.id !== id));
  };

  const handleEdit = (id: number) => {
    // Navigate to edit page
    navigate(`/admin/properties/${id}/edit`);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Imóveis</h2>
        <Button 
          onClick={() => navigate('/admin/properties/new')}
          className="bg-eliteOrange hover:bg-eliteOrange-light"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Imóvel
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Search */}
        <div className="flex-1">
          <Label>Buscar</Label>
          <Input
            placeholder="Buscar imóveis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="w-64">
          <Label>Filtrar por Status</Label>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="vendido">Vendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Quartos</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.title}</TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>{property.type}</TableCell>
                <TableCell>{property.bedrooms}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(property.price)}
                </TableCell>
                <TableCell className={`px-4 py-2 ${
                  property.status === 'ativo' ? 'bg-green-100 text-green-800' :
                  property.status === 'inativo' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                } rounded-full text-sm font-medium`}>{property.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(property.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Properties;
