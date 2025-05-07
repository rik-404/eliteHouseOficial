import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '../../types/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PasswordDialog from '@/components/admin/PasswordDialog';
import { Card, CardContent } from '@/components/ui/card';
import ClientKanban from '@/components/admin/ClientKanban';


const getStatusColor = (status: string) => {
  const statusColors = {
    Novo: '#22C55E',
    Atendimento: '#F59E0B',
    'Análise documental': '#F59E0B',
    'Análise bancária': '#F59E0B',
    Aprovado: '#22C55E',
    Condicionado: '#F59E0B',
    Reprovado: '#EF4444',
    'Venda realizada': '#22C55E',
    Distrato: '#EF4444'
  };
  return statusColors[status] || '#6B7280';
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isKanbanView, setIsKanbanView] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientToDelete.id);

      if (deleteError) {
        throw deleteError;
      }

      // Atualizar a lista de clientes
      await fetchClients();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setError('Erro ao excluir cliente');
    }
  };



  const handleUpdateClientStatus = async (clientId: string, newStatus: string) => {
    try {
      setLoading(true);
      await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId);
      await fetchClients();
    } catch (error) {
      console.error('Erro ao atualizar status do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewClient = () => {
    navigate('/admin/new-client/new');
  };

  const handleEditClient = (clientId: string) => {
    navigate(`/admin/new-client/${clientId}`);
  };



  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando busca de dados...');

      // Buscar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('id', { ascending: true });

      if (clientsError) throw clientsError;
      console.log('Clientes carregados:', clientsData);
      setClients(clientsData || []);

      // Buscar corretores com role 'corretor'
      const { data: brokersData, error: brokersError } = await supabase
        .from('users')
        .select('id, broker_id, name')
        .eq('role', 'corretor')
        .order('name');

      if (brokersError) throw brokersError;
      
      console.log('Dados brutos dos corretores:', brokersData);
      
      if (!brokersData || brokersData.length === 0) {
        console.log('Nenhum corretor encontrado com broker_id');
        setBrokers([]);
        setError('Nenhum corretor encontrado no sistema');
      } else {
        // Converter os dados para usar o broker_id (UUID)
        const formattedBrokers = brokersData.map(broker => ({
          id: broker.broker_id, // Usando broker_id (UUID) para o select
          broker_id: broker.broker_id, // UUID (para a tabela)
          name: broker.name
        }));
        
        console.log('Corretores formatados:', formattedBrokers);
        setBrokers(formattedBrokers);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const brokerMatch = !selectedBroker || selectedBroker === 'all' || client.broker_id === selectedBroker;
      const statusMatch = !selectedStatus || selectedStatus === 'all' || client.status === selectedStatus;
      return brokerMatch && statusMatch;
    });
  }, [clients, selectedBroker, selectedStatus]);

  // Função para encontrar o nome do corretor
  const getBrokerName = (brokerId: string) => {
    const broker = brokers.find(b => b.broker_id === brokerId);
    return broker ? broker.name : 'Corretor não encontrado';
  };

  return (
    <div className="container mx-auto p-4">
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o cliente "{clientToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setClientToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <PasswordDialog onConfirm={confirmDelete} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <Button
            variant="outline"
            onClick={() => setIsKanbanView(!isKanbanView)}
          >
            {isKanbanView ? 'Ver Lista' : 'Ver Kanban'}
          </Button>
          <div className="flex gap-4">
            <Select
              value={selectedBroker || 'all'}
              onValueChange={setSelectedBroker}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar corretor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Corretores</SelectItem>
                {brokers.map((broker) => (
                  <SelectItem key={broker.id} value={broker.id}>
                    {broker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedStatus || 'all'}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleNewClient}
            >
            Novo Cliente
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>
          {isKanbanView ? (
            <ClientKanban
              clients={filteredClients}
              updateClientStatus={handleUpdateClientStatus}
              loading={loading}
              brokers={brokers}
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Corretor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-40">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.cpf}</TableCell>
                        <TableCell>{getBrokerName(client.broker_id)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {client.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              className="bg-yellow-500 hover:bg-yellow-600 text-white"
                              size="sm"
                              onClick={() => handleEditClient(client.id)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="default"
                              className="bg-red-500 hover:bg-red-600 text-white"
                              size="sm"
                              onClick={() => handleDelete(client)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Clients;
