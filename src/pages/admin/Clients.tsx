import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SquareKanban, List, Pencil, Trash, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const { user } = useAuth();

  // Função para verificar se o usuário pode ver pendentes
  const canViewPendentes = (user: any) => {
    return user?.role === 'admin' || user?.role === 'dev';
  };

  // Função para alternar entre ver todos e ver pendentes




  useEffect(() => {
    if (user?.role === 'corretor') {
      setSelectedBroker(user.broker_id);
    }
    fetchClients();

    // Configurar escuta em tempo real
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      // Limpar a escuta quando o componente for desmontado
      channel.unsubscribe();
    };
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
    navigate('/admin/clients/new');
  };

  const handleEditClient = (clientId: string) => {
    navigate(`/admin/clients/${clientId}/edit`);
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== INÍCIO fetchClients ===');
      console.log('Filtros atuais:', {
        selectedBroker,
        selectedStatus,
        searchParams: Object.fromEntries(searchParams.entries())
      });
      
      // Log do estado atual dos filtros
      console.log('Estado dos filtros na função fetchClients:', {
        selectedBroker,
        selectedStatus,
        schedulingParam: searchParams.get('scheduling'),
        brokerParam: searchParams.get('broker')
      });

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

      // Contar clientes pendentes (status 'pending')
      const { data: pendingData } = await supabase
        .from('clients')
        .select('id')
        .eq('status', 'pending');
      setPendingCount(pendingData?.length || 0);

      // Iniciar a construção da query
      console.log('Construindo query para buscar clientes...');
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtro de corretor
      const brokerParam = searchParams.get('broker');
      console.log('=== FILTRO DE CORRETOR ===');
      console.log('brokerParam:', brokerParam);
      console.log('selectedBroker:', selectedBroker);
      
      // Lógica de filtro de corretor
      console.log('=== APLICANDO FILTRO DE CORRETOR ===');
      console.log('brokerParam:', brokerParam);
      console.log('selectedBroker:', selectedBroker);
      
      // Se tivermos um parâmetro de URL
      if (brokerParam !== null) {
        if (brokerParam !== 'all') {
          console.log('Aplicando filtro de corretor da URL:', brokerParam);
          query = query.eq('broker_id', brokerParam);
        } else {
          console.log('Mostrando todos os corretores (parâmetro all)');
          // Não aplicamos filtro de corretor
        }
      } 
      // Se não tivermos parâmetro de URL mas tivermos um corretor selecionado
      else if (selectedBroker && selectedBroker !== 'all') {
        console.log('Aplicando filtro de corretor do estado:', selectedBroker);
        query = query.eq('broker_id', selectedBroker);
      } else {
        console.log('Nenhum corretor selecionado - mostrando todos os corretores');
        // Não aplicamos filtro de corretor
      }

      // Aplicar filtro de status de agendamento
      const schedulingParam = searchParams.get('scheduling');
      if (schedulingParam !== null) {
        console.log('Aplicando filtro de agendamento (da URL):', schedulingParam);
        if (schedulingParam === '') {
          console.log('Buscando clientes sem status de agendamento');
          query = query.is('scheduling', null);
        } else {
          console.log('Buscando clientes com status de agendamento:', schedulingParam);
          // Se for um status de agendamento, usamos o campo scheduling
          query = query.eq('scheduling', schedulingParam);
        }
      } else if (selectedStatus) {
        if (selectedStatus === 'all') {
          console.log('Buscando todos os status (exceto pendentes)');
          query = query.neq('status', 'pending');
        } else {
          // Verifica se o selectedStatus é um status de agendamento
          const isSchedulingStatus = ['Aguardando', 'Nao_Realizado', 'Realizado'].includes(selectedStatus);
          if (isSchedulingStatus) {
            console.log('Aplicando filtro de agendamento (do estado):', selectedStatus);
            query = query.eq('scheduling', selectedStatus);
          } else {
            console.log('Aplicando filtro de status (do estado):', selectedStatus);
            query = query.eq('status', selectedStatus);
          }
        }
      }

      // Aplicar filtro de origem da URL
      const originFilter = searchParams.get('origin');
      if (originFilter !== null) {
        if (originFilter === '') {
          console.log('Buscando clientes sem origem definida');
          query = query.is('origin', null);
        } else {
          console.log('Aplicando filtro de origem:', originFilter);
          query = query.eq('origin', originFilter);
        }
      }

      // Log da query construída
      console.log('Query construída:', {
        table: 'clients',
        select: '*',
        order: 'created_at',
        filters: {
          broker_id: searchParams.get('broker') || selectedBroker,
          scheduling: searchParams.get('scheduling'),
          status: selectedStatus === 'all' ? 'not pending' : selectedStatus
        }
      });

      console.log('Executando query...');
      const { data, error } = await query;

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      console.log('=== RESULTADO DA CONSULTA ===');
      console.log('Dados retornados:', data);
      console.log('Total de registros:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('Nenhum cliente encontrado com os filtros atuais');
        console.log('Filtros aplicados:', {
          broker: searchParams.get('broker') || selectedBroker,
          scheduling: searchParams.get('scheduling'),
          status: selectedStatus
        });
        setClients([]);
      } else {
        console.log(`Encontrados ${data.length} clientes com os filtros atuais`);
        console.log('Primeiros 3 registros:', data.slice(0, 3));
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
        console.log('Clientes atualizados com sucesso');
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setError('Erro ao buscar clientes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      console.log('=== FIM fetchClients ===');
    }
  };

  // Efeito para lidar com os parâmetros da URL
  useEffect(() => {
    console.log('=== EFEITO: Parâmetros da URL ===');
    console.log('URL completa:', window.location.href);
    console.log('Parâmetros da URL (searchParams):', Object.fromEntries(searchParams.entries()));
    console.log('Estado atual - selectedBroker:', selectedBroker, 'selectedStatus:', selectedStatus);
    console.log('Tipo de selectedStatus:', typeof selectedStatus);
    console.log('Comprimento de selectedStatus:', selectedStatus?.length);
    console.log('Valor exato:', JSON.stringify(selectedStatus));
    
    let shouldUpdate = false;
    const brokerParam = searchParams.get('broker');
    const schedulingParam = searchParams.get('scheduling');
    
    console.log('Parâmetros extraídos:', { brokerParam, schedulingParam });

    // Atualiza o broker se necessário
    if (brokerParam !== null) {
      if (brokerParam === 'all') {
        console.log('Definindo filtro para todos os corretores');
        if (selectedBroker !== null) {
          setSelectedBroker(null);
          shouldUpdate = true;
        }
      } else if (brokerParam !== selectedBroker) {
        console.log('Atualizando broker para:', brokerParam);
        setSelectedBroker(brokerParam);
        shouldUpdate = true;
      } else {
        console.log('Broker não foi alterado');
      }
    } else if (selectedBroker) {
      console.log('Limpando filtro de broker');
      setSelectedBroker(null);
      shouldUpdate = true;
    } else {
      console.log('Nenhuma alteração necessária no broker');
    }
    
    // Atualiza o status de agendamento se necessário
    if (schedulingParam !== null && schedulingParam !== selectedStatus) {
      console.log('Atualizando status de agendamento para:', schedulingParam);
      console.log('Tipo do schedulingParam:', typeof schedulingParam);
      console.log('Comprimento do schedulingParam:', schedulingParam.length);
      console.log('Valor exato do schedulingParam:', JSON.stringify(schedulingParam));
      
      // Força o valor correto
      const correctedStatus = schedulingParam === 'Aguardand' ? 'Aguardando' : schedulingParam;
      console.log('Valor corrigido para:', correctedStatus);
      
      setSelectedStatus(correctedStatus);
      shouldUpdate = true;
    } else if (schedulingParam === null && selectedStatus) {
      console.log('Limpando filtro de agendamento');
      setSelectedStatus(null);
      shouldUpdate = true;
    } else {
      console.log('Status de agendamento não foi alterado');
    }
    
    // Só recarrega os clientes se houver alguma mudança
    if (shouldUpdate) {
      console.log('=== INICIANDO ATUALIZAÇÃO ===');
      console.log('Recarregando clientes com filtros:', {
        broker: brokerParam,
        scheduling: schedulingParam
      });
      // Força a atualização dos clientes com os novos parâmetros
      fetchClients();
    } else {
      console.log('Nenhuma mudança detectada nos parâmetros da URL');
      // Mesmo sem mudanças, verifica se precisa recarregar com base nos parâmetros atuais
      if (brokerParam || schedulingParam) {
        console.log('Aplicando filtros da URL');
        fetchClients();
      }
    }
  }, [searchParams]);
  
  // Efeito para recarregar os clientes quando o broker ou status mudar
  useEffect(() => {
    console.log('=== EFEITO: Estado do filtro alterado ===');
    console.log('Novos valores - selectedBroker:', selectedBroker, 'selectedStatus:', selectedStatus);
    
    // Se tiver um parâmetro de agendamento na URL, mantemos o filtro independente do status
    const schedulingParam = searchParams.get('scheduling');
    if (schedulingParam) {
      console.log('Filtro de agendamento ativo na URL:', schedulingParam);
    }
    
    fetchClients();
  }, [selectedBroker, selectedStatus, searchParams]);

  const filteredClients = useMemo(() => {
    console.log('=== FILTRANDO CLIENTES ===');
    console.log('Total de clientes:', clients.length);
    console.log('Filtros ativos - selectedBroker:', selectedBroker, 'selectedStatus:', selectedStatus);
    
    return clients.filter(client => {
      // Filtro de corretor
      const brokerMatch = !selectedBroker || selectedBroker === 'all' || client.broker_id === selectedBroker;
      
      // Filtro de status e agendamento
      const schedulingStatus = searchParams.get('scheduling');
      let statusMatch = true;
      
      // Se tiver um filtro de agendamento na URL, aplica apenas esse filtro
      if (schedulingStatus !== null) {
        statusMatch = schedulingStatus === '' ? !client.scheduling : client.scheduling === schedulingStatus;
      } 
      // Se não tiver filtro de agendamento, aplica o filtro de status normal
      else if (selectedStatus && selectedStatus !== 'all') {
        statusMatch = client.status === selectedStatus;
      }
      
      // Filtro de origem
      const originFilter = searchParams.get('origin');
      const originMatch = !originFilter || 
                        (originFilter === '' ? !client.origin : client.origin === originFilter);
      
      // Se for corretor, filtra apenas os clientes dele
      if (user?.role === 'corretor') {
        return client.broker_id === user.broker_id && statusMatch && originMatch;
      }
      
      // Para admin, aplica todos os filtros
      return brokerMatch && statusMatch && originMatch;
    });
  }, [clients, selectedBroker, selectedStatus, searchParams, user?.role, user?.broker_id]);

  const getBrokerName = (brokerId: string) => {
    const broker = brokers.find(b => b.broker_id === brokerId);
    return broker ? broker.name : 'Corretor não encontrado';
  };

  return (
    <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {searchParams.get('origin') && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Origem: {searchParams.get('origin') || 'Não informada'}
                </span>
              )}
              {searchParams.get('scheduling') !== null && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Agendamento: {searchParams.get('scheduling') || 'Sem status'}
                  <button 
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('scheduling');
                      navigate({ search: newParams.toString() });
                    }}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="statusFilter" className="text-sm">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(statusColors).map(([status, color]) => (
                  <SelectItem key={status} value={status}>
                    <span style={{ color }} className="mr-2">•</span>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              onClick={() => navigate('/admin/clients/new')}
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </div>
        </div>
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
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
            onClick={() => setIsKanbanView(!isKanbanView)}
            disabled={selectedStatus === 'pending'}
          >
            {isKanbanView ? 'Ver Lista' : 'Ver Kanban'}
            {isKanbanView ? <List className="w-4 h-4" /> : <SquareKanban className="w-4 h-4" />}
          </Button>
          <Select
            value={selectedBroker}
            onValueChange={setSelectedBroker}
            disabled={selectedStatus === 'pending' || !brokers.length || user?.role === 'corretor'}
          >
            <SelectTrigger className="bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-8 text-left shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              {user?.role === 'corretor' ? getBrokerName(user.broker_id) : (selectedBroker ? getBrokerName(selectedBroker) : 'Selecione um corretor')}
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all">Todos os corretores</SelectItem>
              {brokers.map((broker, index) => (
                <SelectItem 
                  key={`broker-${broker.broker_id}-${index}`} 
                  value={broker.broker_id}
                >
                  {broker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canViewPendentes(user) && (
            <div className="flex gap-2">
              <Button
                variant="default"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setSelectedStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant="outline"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 relative"
                onClick={() => setSelectedStatus('pending')}
                disabled={isKanbanView}
              >
                <span className="flex items-center gap-2">
                  <span>Pendentes</span>
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-500 text-white">
                    {pendingCount}
                  </span>
                </span>
              </Button>
            </div>
          )}

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
              user={user}
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
                      <TableHead>Agendamento</TableHead>
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
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              !client.scheduling ? 'bg-gray-100 text-gray-800' :
                              client.scheduling === 'Aguardando' ? 'bg-yellow-100 text-yellow-800' :
                              client.scheduling === 'Realizada' ? 'bg-green-100 text-green-800' :
                              client.scheduling === 'Não realizada' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {client.scheduling || 'Sem status'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-medium mb-1">Status</span>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium text-white mb-2"
                              style={{ background: getStatusColor(client.status), minWidth: 90, textAlign: 'center' }}
                            >
                              {client.status}
                            </span>
                            {user?.role === 'corretor' && (client.status === 'Análise bancária' || client.status === 'Aprovado' || client.status === 'Condicionado' || client.status === 'Reprovado') ? (
                                <div className="text-red-500 text-sm">Não pode editar</div>
                              ) : client.status === 'pending' ? (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleAssignBroker(client)}
                                 className="w-full"
                               >
                                 <Plus className="w-4 h-4 mr-2" />
                                 Atribuir ao Corretor
                               </Button>
                             ) : (
                               <div className="flex gap-2">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className={`bg-yellow-400 hover:bg-yellow-500 text-white border-none ${user?.role === 'corretor' && (client.status === 'Análise bancária' || client.status === 'Aprovado' || client.status === 'Condicionado' || client.status === 'Reprovado') ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400 text-gray-100' : ''}`}
                                   onClick={() => {
                                     if (user?.role === 'corretor' && (client.status === 'Análise bancária' || client.status === 'Aprovado' || client.status === 'Condicionado' || client.status === 'Reprovado')) {
                                       return;
                                     }
                                     handleEditClient(client.id);
                                   }}
                                 >
                                   <Pencil className="w-4 h-4 mr-2" />
                                   Editar
                                 </Button>
                                 <Button
                                   variant="destructive"
                                   size="sm"
                                   onClick={() => user?.role !== 'corretor' && handleDelete(client)}
                                   disabled={user?.role === 'corretor'}
                                   className={`cursor-not-allowed ${user?.role === 'corretor' ? 'bg-gray-400 hover:bg-gray-400 text-gray-100 border-gray-300' : ''}`}
                                 >
                                   <Trash className="w-4 h-4 mr-2" />
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
