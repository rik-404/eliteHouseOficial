import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertCircle, Clock, MoreHorizontal, Calendar, User, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
// Removido import do ClientProfileModal

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  complement?: string;
  broker_id: string;
  status: string;
  notes: string;
  scheduling?: string;
}

interface ClientKanbanProps {
  clients: Client[];
  updateClientStatus: (clientId: string, newStatus: string) => Promise<void>;
  loading: boolean;
  brokers: any[];
  user: {
    role: string;
  };
}

const statuses = [
  'Novo',
  'Atendimento',
  'Análise documental',
  'Análise bancária',
  'Aprovado',
  'Condicionado',
  'Reprovado',
  'Venda realizada',
  'Distrato'
];

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

const ClientKanban: React.FC<ClientKanbanProps> = ({ clients, updateClientStatus, loading, brokers, user }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [minimizedStatuses, setMinimizedStatuses] = React.useState<Record<string, boolean>>({});
  const [currentPages, setCurrentPages] = React.useState<Record<string, number>>(
    statuses.reduce((acc, status) => ({ ...acc, [status]: 1 }), {})
  );
  const itemsPerPage = 10;
  
  const toggleMinimizeStatus = (status: string) => {
    setMinimizedStatuses(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };
  const getBrokerName = (brokerId: string) => {
    if (!brokers) return 'Sem corretor';
    const broker = brokers.find(b => b.broker_id === brokerId);
    return broker ? broker.name : 'Sem corretor';
  };

  // Dividir os status em duas linhas para melhor visualização
  const firstRowStatuses = statuses.slice(0, 5); // Primeiros 5 status
  const secondRowStatuses = statuses.slice(5);   // Restantes

  const getClientsInStatus = (status: string) => {
    const allClientsInStatus = clients.filter(client => client.status === status);
    const currentPage = currentPages[status] || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allClientsInStatus.slice(startIndex, endIndex);
  };

  const getTotalPages = (status: string) => {
    const totalClients = clients.filter(client => client.status === status).length;
    return Math.ceil(totalClients / itemsPerPage);
  };

  const handlePageChange = (status: string, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [status]: newPage
    }));
  };

  const handleEditClient = (clientId: string) => {
    navigate(`/admin/clients/${clientId}/edit`);
  };

  const renderStatusColumn = (status: string) => {
    const clientsInStatus = getClientsInStatus(status);
    const isRestrictedStatus = !(user.role === 'admin' || user.role === 'dev') && 
      (status === 'Análise bancária' || status === 'Aprovado' || status === 'Condicionado' || status === 'Reprovado');
    const isMinimized = minimizedStatuses[status] || false;
    return (
      <div key={status} className="min-w-[400px] px-4">
        <div className="rounded-md overflow-hidden" style={{ backgroundColor: getStatusColor(status) }}>
          <div className="flex items-center justify-between p-2 text-white">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimizeStatus(status);
                }}
                className="text-white hover:bg-white/20 p-1 rounded"
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                {isMinimized ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              </button>
              <h3 className="text-sm font-semibold whitespace-nowrap">{status}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white bg-opacity-30 rounded-full h-5 min-w-5 flex items-center justify-center text-white text-xs">
                {clients.filter(c => c.status === status).length}
              </div>
            </div>
          </div>
        </div>
        {isRestrictedStatus && (
          <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
            <AlertCircle className="inline w-4 h-4 mr-1" />
            Apenas administradores podem mover clientes deste status
          </div>
        )}

        <div 
          className={`bg-white rounded-md p-1 border border-gray-100 w-full transition-all duration-200 ${
            isMinimized ? 'max-h-[40px] overflow-hidden' : 'min-h-[150px]'
          }`}
        >
          <Droppable droppableId={status}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {clientsInStatus.length === 0 ? (
                  <div className="text-xs text-center text-gray-500 p-2">
                    Nenhum cliente neste status
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-2">
                    {clientsInStatus.map((client, index) => (
                      <Draggable
                        key={client.id}
                        draggableId={client.id}
                        index={index}
                        isDragDisabled={(user?.role !== 'admin' && user?.role !== 'dev') && 
                          (client.status === 'Análise bancária' || 
                           client.status === 'Aprovado' || 
                           client.status === 'Condicionado' || 
                           client.status === 'Reprovado')}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            // Removido o comportamento de abrir o pop-up ao clicar
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium text-sm" style={{ color: '#003366' }}>{client.name}</h3>
                                <p className="text-xs text-gray-500">{client.email}</p>
                                <p className="text-xs text-gray-500">Corretor: <span className="font-bold">{getBrokerName(client.broker_id)}</span></p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`bg-yellow-400 hover:bg-yellow-500 text-white border-none ${
                                  (user?.role === 'corretor' && 
                                  (client.status === 'Análise bancária' || 
                                   client.status === 'Aprovado' || 
                                   client.status === 'Condicionado' || 
                                   client.status === 'Reprovado')) 
                                    ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400 text-gray-100' 
                                    : ''
                                }`}
                                onClick={() => {
                                  // Permite que admin e dev editem qualquer cliente
                                  if (user?.role === 'corretor' && 
                                      (client.status === 'Análise bancária' || 
                                       client.status === 'Aprovado' || 
                                       client.status === 'Condicionado' || 
                                       client.status === 'Reprovado')) {
                                    return;
                                  }
                                  navigate(`/admin/clients/${client.id}/edit`);
                                }}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Perfil
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    </div>
                    {getTotalPages(status) > 1 && (
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentPages[status] > 1) {
                              handlePageChange(status, currentPages[status] - 1);
                            }
                          }}
                          disabled={currentPages[status] <= 1}
                          className={`px-2 py-1 rounded ${currentPages[status] <= 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-50'}`}
                        >
                          Anterior
                        </button>
                        <span className="text-gray-600">
                          Página {currentPages[status]} de {getTotalPages(status)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentPages[status] < getTotalPages(status)) {
                              handlePageChange(status, currentPages[status] + 1);
                            }
                          }}
                          disabled={currentPages[status] >= getTotalPages(status)}
                          className={`px-2 py-1 rounded ${currentPages[status] >= getTotalPages(status) ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-50'}`}
                        >
                          Próxima
                        </button>
                      </div>
                    )}
                  </>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    );
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    if (result.source.droppableId !== result.destination.droppableId) {
      const [source, destination] = [result.source.droppableId, result.destination.droppableId];
      const sourceClients = getClientsInStatus(source);
      const draggedClient = sourceClients[result.source.index];

      // Verificar se o usuário é admin ou dev - se for, permitir mover livremente
      const isAdminOrDev = user?.role === 'admin' || user?.role === 'dev';
      
      // Se não for admin/dev, verificar se o cliente está em um status restrito
      if (!isAdminOrDev && (draggedClient.status === 'Análise bancária' || 
                           draggedClient.status === 'Aprovado' || 
                           draggedClient.status === 'Condicionado' || 
                           draggedClient.status === 'Reprovado')) {
        alert('Você não tem permissão para mover clientes deste status');
        return;
      }

      try {
        setIsLoading(true);
        await updateClientStatus(draggedClient.id, destination);
      } catch (error) {
        console.error('Erro ao atualizar status do cliente:', error);
        alert('Ocorreu um erro ao atualizar o status do cliente');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Removido o código que renderizava o modal de perfil do cliente

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap w-full">
          {statuses.map((status) => (
            <div key={status} className="min-w-[400px] px-4">
              <div className="rounded-md overflow-hidden" style={{ backgroundColor: getStatusColor(status) }}>
                <div className="flex items-center justify-between p-2 text-white">
                  <h3 className="text-sm font-semibold">{status}</h3>
                  <div className="bg-white bg-opacity-30 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs">0</div>
                </div>
              </div>
              <div className="mt-2 bg-white rounded-md p-3 min-h-[300px] max-h-[500px] overflow-y-auto border border-gray-100">
                <div className="animate-pulse">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 p-2 rounded-md">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const mainScrollRef = React.useRef<HTMLDivElement>(null);
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const isScrolling = React.useRef(false);

  // Efeito para sincronizar os scrolls
  React.useEffect(() => {
    const mainElement = mainScrollRef.current;
    const topElement = topScrollRef.current;

    if (!mainElement || !topElement) return;

    const handleMainScroll = () => {
      if (isScrolling.current) return;
      isScrolling.current = true;
      if (topElement) {
        topElement.scrollLeft = mainElement.scrollLeft;
      }
      requestAnimationFrame(() => {
        isScrolling.current = false;
      });
    };

    const handleTopScroll = () => {
      if (isScrolling.current) return;
      isScrolling.current = true;
      if (mainElement) {
        mainElement.scrollLeft = topElement.scrollLeft;
      }
      requestAnimationFrame(() => {
        isScrolling.current = false;
      });
    };

    mainElement.addEventListener('scroll', handleMainScroll);
    topElement.addEventListener('scroll', handleTopScroll);

    return () => {
      mainElement.removeEventListener('scroll', handleMainScroll);
      topElement.removeEventListener('scroll', handleTopScroll);
    };
  }, []);

  return (
    <div className="p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Barra de rolagem superior funcional */}
        <div 
          ref={topScrollRef}
          className="mb-2 overflow-x-auto pb-2" 
          style={{ cursor: 'grab' }}
        >
          <div 
            className="flex gap-2 w-max" 
            style={{ height: '1px', visibility: 'hidden' }}
          >
            {statuses.map((status) => (
              <div key={`spacer-${status}`} className="min-w-[400px] px-4"></div>
            ))}
          </div>
        </div>
        
        {/* Área rolável principal */}
        <div 
          ref={mainScrollRef}
          className="flex gap-2 overflow-x-auto whitespace-nowrap w-full"
        >
          {statuses.map(renderStatusColumn)}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ClientKanban;
