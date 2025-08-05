import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { usePendingCount } from '@/hooks/usePendingCount';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SquareKanban, List, User, Trash, Plus, Bell } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/TempAuthContext';
import { Client } from '../../types/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PasswordDialog from '@/components/admin/PasswordDialog';
import { Card, CardContent } from '@/components/ui/card';
import ClientKanban from '@/components/admin/ClientKanban';
import AssignBrokerModal from '@/components/admin/AssignBrokerModal';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useClientNotifications } from '@/hooks/useClientNotifications';

// Hook para notificações na tela
export const useNotification = () => {
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);
  
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    
    // Remove a notificação após 5 segundos
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  return { notification, showNotification };
};

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
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { 
    pendingCount, 
    loading: pendingLoading 
  } = usePendingCount();
  const { notification } = useNotification();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [assignBrokerOpen, setAssignBrokerOpen] = useState(false);
  const [clientToAssign, setClientToAssign] = useState<Client | null>(null);
  const [isKanbanView, setIsKanbanView] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Função para verificar se o usuário pode ver pendentes
  const canViewPendentes = (user: any) => {
    return user?.role === 'admin' || user?.role === 'dev';
  };

  // Função para verificar se o usuário é corretor e encontrar seu broker_id
  const getBrokerFilter = (user: any) => {
    if (user?.role === 'corretor') {
      return user.broker_id;
    }
    return null;
  };

  // Efeito para configurar notificações em tempo real
  useEffect(() => {
    // Carrega o som de notificação
    notificationSound.current = new Audio('/sounds/notification.mp3');
    notificationSound.current.load();

    // Configura a escuta em tempo real para novos clientes
    const channel = supabase
      .channel('new-clients-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients',
          filter: 'status=eq.pending'
        },
        async (payload) => {
          console.log('Novo cliente pendente detectado:', payload.new);
          
          // Toca o som de notificação
          if (notificationSound.current) {
            try {
              // Força o carregamento do áudio a cada notificação
              await notificationSound.current.load();
              notificationSound.current.currentTime = 0;
              await notificationSound.current.play();
              console.log('Notificação sonora reproduzida com sucesso');
            } catch (e) {
              console.error('Erro ao reproduzir notificação:', e);
            }
          }
          
          // Recarrega a lista de clientes
          fetchClients();
        }
      )
      .subscribe((status) => {
        console.log('Status da inscrição no canal:', status);
      });

    // Log para confirmar que o efeito foi executado
    console.log('Escuta em tempo real configurada para novos clientes pendentes');

    return () => {
      // Limpa a escuta quando o componente é desmontado
      channel.unsubscribe();
      console.log('Escuta em tempo real encerrada');
    };
  }, []);

  // Efeito para carregar os clientes iniciais
  useEffect(() => {
    if (user?.role === 'corretor') {
      setSelectedBroker(user.broker_id);
    }
    fetchClients();
  }, [user?.broker_id]);

  const checkScheduledVisits = async (clientId: string) => {
    try {
      const { data: visits, error } = await supabase
        .from('scheduling')
        .select('id')
        .eq('client_id', clientId)
        .not('status', 'in', '(concluido,cancelado)');

      if (error) {
        console.error('Erro ao verificar visitas:', error);
        return false;
      }

      return visits?.length > 0;
    } catch (error) {
      console.error('Erro ao verificar visitas:', error);
      return false;
    }
  };

  const handleDelete = async (client: Client) => {
    if (user?.role === 'corretor') {
      setError('Corretores não podem excluir clientes');
      return;
    }

    const hasScheduledVisits = await checkScheduledVisits(client.id);
    if (hasScheduledVisits) {
      setError('Este cliente possui visitas agendadas. Por favor, cancele ou conclua as visitas antes de excluir o cliente.');
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

  const { logDelete } = useActivityLog();

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      // Primeiro busca os documentos do cliente para excluí-los
      const { data: clientDocuments, error: documentsError } = await supabase
        .from('client_documents')
        .select('id, file_path')
        .eq('client_id', clientToDelete.id);

      if (documentsError) {
        throw documentsError;
      }

      // Exclui cada documento do storage e do banco de dados
      if (clientDocuments && clientDocuments.length > 0) {
        // Exclui os arquivos do storage
        const filePaths = clientDocuments.map(doc => doc.file_path);
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove(filePaths);

          if (storageError) {
            console.error('Erro ao excluir arquivos do storage:', storageError);
            // Continuamos mesmo com erro no storage para garantir que os registros sejam removidos
          }
        }

        // Exclui os registros de documentos do banco de dados
        const { error: deleteDocsError } = await supabase
          .from('client_documents')
          .delete()
          .eq('client_id', clientToDelete.id);

        if (deleteDocsError) {
          throw deleteDocsError;
        }
      }

      // Exclui as visitas relacionadas
      const { error: deleteVisitsError } = await supabase
        .from('scheduling')
        .delete()
        .eq('client_id', clientToDelete.id);

      if (deleteVisitsError) {
        throw deleteVisitsError;
      }

      // Por último, exclui o cliente
      const { error: deleteClientError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientToDelete.id);

      if (deleteClientError) {
        throw deleteClientError;
      }

      // Usar broker_id do usuário
      const brokerId = user?.broker_id;
      
      if (!brokerId) {
        throw new Error('Broker ID não encontrado');
      }

      await logDelete(
        'clients',
        clientToDelete.id,
        `Cliente ${clientToDelete.name} excluído (incluindo visitas agendadas)`,
        clientToDelete.name,
        brokerId
      );

      await fetchClients();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setError('Erro ao excluir cliente. Por favor, tente novamente.');
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

      // Verificar se há um parâmetro de status na URL
      const statusParam = searchParams.get('status');
      
      // Aplicar filtro de status de agendamento
      const schedulingParam = searchParams.get('scheduling');
      
      // Verificar se estamos filtrando por um status específico
      if (statusParam) {
        console.log('Filtrando por status:', statusParam);
        query = query.eq('status', statusParam);
      } else if (schedulingParam !== null) {
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
          console.log('Buscando todos os status (incluindo pendentes)');
          // Não aplicar nenhum filtro de status para mostrar todos
        } else if (selectedStatus === 'pending') {
          console.log('Filtrando apenas clientes pendentes');
          query = query.eq('status', 'pending');
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
      } else {
        console.log('Nenhum filtro de status aplicado - mostrando todos os clientes');
        // Não aplicar nenhum filtro de status para mostrar todos
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
    const statusParam = searchParams.get('status');
    
    console.log('Parâmetros extraídos:', { brokerParam, schedulingParam, statusParam });
    
    // Se tivermos um parâmetro de status na URL, atualizar o selectedStatus
    if (statusParam) {
      console.log('Definindo status para:', statusParam);
      if (selectedStatus !== statusParam) {
        setSelectedStatus(statusParam);
        shouldUpdate = true;
      }
    }

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
    
    // Resetar para a primeira página quando os filtros mudarem
    setCurrentPage(1);
    fetchClients();
  }, [selectedBroker, selectedStatus, searchParams]);

  const filteredClients = useMemo(() => {
    console.log('=== FILTRANDO CLIENTES ===');
    console.log('Total de clientes:', clients.length);
    console.log('Filtros ativos - selectedBroker:', selectedBroker, 'selectedStatus:', selectedStatus);
    
    // Verificar se há um parâmetro de status na URL
    const statusParam = searchParams.get('status');
    
    // Se estamos filtrando por um status específico da URL
    if (statusParam) {
      console.log(`Filtrando por status ${statusParam} no frontend`);
      return clients.filter(client => {
        // Se for corretor, filtra apenas os clientes dele com o status especificado
        if (user?.role === 'corretor') {
          return client.status === statusParam && client.broker_id === user.broker_id;
        }
        // Para admin, mostra todos os clientes com o status especificado
        return client.status === statusParam;
      });
    }
    
    // Filtro normal para outros casos
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

  // Cálculo da paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Componente de paginação reutilizável
  const PaginationControls = ({ position = 'bottom' }) => (
    <div className={`flex items-center justify-between ${position === 'top' ? 'mb-4' : 'mt-4'}`}>
      <div className="text-sm text-gray-500">
        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredClients.length)} de {filteredClients.length} clientes
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Mostra no máximo 5 páginas de cada vez
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? "bg-blue-500 text-white" : ""}
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-2">...</span>
          )}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              className={currentPage === totalPages ? "bg-blue-500 text-white" : ""}
            >
              {totalPages}
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
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
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 dark:bg-green-600 dark:hover:bg-green-700"
              onClick={() => navigate('/admin/clients/new')}
            >
              <Plus className="w-4 h-4" />
              <span>Novo</span>
            </Button>
          </div>
        </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground dark:text-gray-300">
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

      <div className="flex justify-between items-center mb-6 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-4">

          <Button
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 dark:bg-orange-600 dark:hover:bg-orange-700"
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
            <SelectTrigger className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-4 pr-8 text-left shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white">
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
                className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                onClick={() => {
                  setSelectedStatus(null);
                  navigate('/admin/clients');
                }}
              >
                Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${selectedStatus === 'pending' ? 'bg-yellow-600' : 'bg-yellow-400'} hover:bg-yellow-500 text-white border-none flex items-center gap-1 dark:bg-yellow-600 dark:hover:bg-yellow-700`}
                onClick={() => {
                  setSelectedStatus('pending');
                  navigate('/admin/clients?status=pending');
                }}
                disabled={isKanbanView}
              >
                <Bell className="w-4 h-4" />
                Pendentes ({pendingCount})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Controles de paginação superiores - apenas no modo lista */}
      {!isKanbanView && filteredClients.length > itemsPerPage && (
        <PaginationControls position="top" />
      )}

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
              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:bg-gray-700">
                      <TableHead className="dark:text-white">Nome</TableHead>
                      <TableHead className="dark:text-white">Email</TableHead>
                      <TableHead className="dark:text-white">Telefone</TableHead>
                      <TableHead className="dark:text-white">CPF</TableHead>
                      <TableHead className="dark:text-white">Corretor</TableHead>
                      <TableHead className="dark:text-white">Agendamento</TableHead>
                      <TableHead className="w-40 text-center dark:text-white">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((client) => (
                      <TableRow key={client.id} className="dark:border-gray-700 hover:dark:bg-gray-700">
                        <TableCell className="dark:text-gray-300">{client.name}</TableCell>
                        <TableCell className="dark:text-gray-300">{client.email}</TableCell>
                        <TableCell className="dark:text-gray-300">{client.phone}</TableCell>
                        <TableCell className="dark:text-gray-300">{client.cpf}</TableCell>
                        <TableCell className="dark:text-gray-300">{getBrokerName(client.broker_id)}</TableCell>
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              !client.scheduling ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100' :
                              client.scheduling === 'Aguardando' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' :
                              client.scheduling === 'Realizada' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' :
                              client.scheduling === 'Não realizada' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' :
                              'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
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
                                  className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
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
                                    <User className="w-4 h-4 mr-2" />
                                    Perfil
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
          
          {/* Controles de paginação inferiores - apenas no modo lista */}
          {!isKanbanView && filteredClients.length > itemsPerPage && (
            <PaginationControls position="bottom" />
          )}
        </div>
      )}
    </div>
  );
};

export { usePendingCount };

export default Clients;
