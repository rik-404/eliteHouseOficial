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
import AssignBrokerModal from '@/components/admin/AssignBrokerModal';


const statusColors = {
  'Novo': '#0096FF',
  'Atendimento': '#20B2AA',
  'Análise documental': '#8A2BE2',
  'Análise bancária': '#9370DB',
  'Aprovado': '#22C55E',
  'Condicionado': '#FF8C00',
  'Reprovado': '#E34234',
  'Venda realizada': '#1E90FF',
  'Distrato': '#555555'
};

const getStatusColor = (status: string) => {
  return statusColors[status] || '#6B7280';
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);

  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);

  // Função para verificar se o usuário é corretor e encontrar seu broker_id
  const getBrokerFilter = (user: any) => {
    if (user?.role === 'corretor') {
      return user.broker_id;
    }
    return null;
  };
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [assignBrokerOpen, setAssignBrokerOpen] = useState(false);
  const [clientToAssign, setClientToAssign] = useState<Client | null>(null);
  const [isKanbanView, setIsKanbanView] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Função para alternar entre ver todos e ver pendentes


  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  useEffect(() => {
    if (user?.role === 'corretor') {
      setSelectedBroker(user.broker_id);
    }
    fetchClients();
  }, [user?.broker_id]);

  const handleDelete = (client: Client) => {
    if (user?.role === 'corretor') {
      setError('Corretores não podem excluir clientes');
      return;
    }
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleAssignBroker = (client: Client) => {
    if (user?.role === 'corretor') {
      setError('Corretores não podem atribuir clientes');
      return;
    }
    setClientToAssign(client);
    setAssignBrokerOpen(true);
  };

  const handleBrokerSelect = async (brokerId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('clients')
        .update({ broker_id: brokerId, status: 'Novo' })
        .eq('id', clientToAssign?.id);

      if (error) throw error;

      // Atualizar o estado local do cliente
      if (clientToAssign) {
        setClients(clients.map(client => 
          client.id === clientToAssign.id ? { ...client, broker_id: brokerId, status: 'Novo' } : client
        ));
      }
      setError(null);
    } catch (error) {
      console.error('Erro ao atribuir corretor:', error);
      setError('Erro ao atribuir corretor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
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
    navigate(`/admin/clients/${clientId}/edit`);
  };

  const fetchClients = async () => {
    try {
      setLoading(true);

      // Buscar corretores
      const { data: brokersData, error: brokersError } = await supabase
        .from('users')
        .select('id, broker_id, name')
        .eq('role', 'corretor')
        .order('name');

      if (brokersError) throw brokersError;

      if (!brokersData || brokersData.length === 0) {
        setBrokers([]);
      } else {
        const formattedBrokers = brokersData.map(broker => ({
          broker_id: broker.broker_id,
          name: broker.name
        }));
        setBrokers(formattedBrokers);
      }

      // Contar pendentes
      const { data: pendingData } = await supabase
        .from('clients')
        .select('id')
        .eq('status', 'pending');
      setPendingCount(pendingData?.length || 0);

      // Buscar clientes
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedBroker) {
        query = query.eq('broker_id', selectedBroker);
      }

      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }



      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        setClients([]);
      } else {
        const formattedClients = data.map(client => ({
          ...client,
          created_at: new Date(client.created_at).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
        setClients(formattedClients);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setError('Erro ao buscar clientes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [selectedBroker, selectedStatus]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      return (!selectedBroker || client.broker_id === selectedBroker) &&
             (!selectedStatus || selectedStatus === 'all' || client.status === selectedStatus);
    });
  }, [clients, selectedBroker, selectedStatus]);

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

      <AssignBrokerModal
        open={assignBrokerOpen}
        brokers={brokers}
        selectedBroker={clientToAssign?.broker_id}
        onBrokerSelect={handleBrokerSelect}
        onClose={() => setAssignBrokerOpen(false)}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">

          <Button
            variant="outline"
            onClick={() => setIsKanbanView(!isKanbanView)}
            className="flex items-center gap-2"
          >
            {isKanbanView ? 'Ver Lista' : 'Ver Kanban'}
            <span className="text-sm">(L)</span>
          </Button>
          <Select
            value={selectedBroker}
            onValueChange={setSelectedBroker}
            disabled={!brokers.length || user?.role === 'corretor'}
          >
            <SelectTrigger className="bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-8 text-left shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              {user?.role === 'corretor' ? getBrokerName(user.broker_id) : (selectedBroker ? getBrokerName(selectedBroker) : 'Selecione um corretor')}
            </SelectTrigger>
            <SelectContent key="brokers-select-content">
              <SelectItem value="all">Todos os corretores</SelectItem>
              {brokers.map(broker => (
                <SelectItem key={broker.id} value={broker.broker_id}>{broker.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                      <TableHead className="w-40 text-center">Ações</TableHead>
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
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-medium mb-1">Status</span>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium text-white mb-2"
                              style={{ background: getStatusColor(client.status), minWidth: 90, textAlign: 'center' }}
                            >
                              {client.status}
                            </span>
                            {client.status === 'pending' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignBroker(client)}
                                className="w-full"
                              >
                                Atribuir ao Corretor
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-yellow-400 hover:bg-yellow-500 text-white border-none"
                                  onClick={() => handleEditClient(client.id)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => user?.role !== 'corretor' && handleDelete(client)}
                                  disabled={user?.role === 'corretor'}
                                  className={`cursor-not-allowed ${user?.role === 'corretor' ? 'bg-gray-400 hover:bg-gray-400 text-gray-100 border-gray-300' : ''}`}
                                >
                                  Excluir
                                </Button>
                              </div>
                            )}
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

// Função para obter o número de pendentes
export const usePendingCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const { data: pendingData } = await supabase
          .from('clients')
          .select('id')
          .eq('status', 'pending');
        setCount(pendingData?.length || 0);
      } catch (error) {
        console.error('Erro ao buscar pendentes:', error);
      }
    };

    fetchPendingCount();
  }, []);

  return count;
};
