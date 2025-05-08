import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  broker_id: string;
}

interface ClientKanbanProps {
  clients: Client[];
  updateClientStatus: (clientId: string, newStatus: string) => Promise<void>;
  loading: boolean;
  brokers: any[];
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

const ClientKanban: React.FC<ClientKanbanProps> = ({ clients, updateClientStatus, loading, brokers }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const getBrokerName = (brokerId: string) => {
    if (!brokers) return 'Sem corretor';
    const broker = brokers.find(b => b.broker_id === brokerId);
    return broker ? broker.name : 'Sem corretor';
  };

  // Dividir os status em duas linhas para melhor visualização
  const firstRowStatuses = statuses.slice(0, 5); // Primeiros 5 status
  const secondRowStatuses = statuses.slice(5);   // Restantes

  const getClientsInStatus = (status: string) => {
    return clients.filter(client => client.status === status);
  };

  const handleEditClient = (clientId: string) => {
    navigate(`/admin/clients/${clientId}/edit`);
  };

  const renderStatusColumn = (status: string) => {
    const clientsInStatus = getClientsInStatus(status);
    return (
      <div key={status} className="w-1/5 px-1">
        <div 
          className="rounded-md overflow-hidden" 
          style={{ backgroundColor: getStatusColor(status) }}
        >
          <div className="flex items-center justify-between p-2 text-white">
            <h3 className="text-sm font-semibold">{status}</h3>
            <div className="bg-white bg-opacity-30 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs">
              {clientsInStatus.length}
            </div>
          </div>
        </div>

        <div className="mt-1 bg-white rounded-md p-1 min-h-[150px] max-h-[300px] overflow-y-auto border border-gray-100">
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
                  <div className="space-y-1">
                    {clientsInStatus.map((client, index) => (
                      <Draggable key={client.id} draggableId={client.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleEditClient(client.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium text-sm">{client.name}</h3>
                                <p className="text-xs text-gray-500">{client.email}</p>
                                <p className="text-xs text-gray-500">Corretor: <span className="font-bold">{getBrokerName(client.broker_id)}</span></p>
                              </div>
                              <Button
                                variant="default"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                size="sm"
                                onClick={() => navigate(`/admin/clients/${client.id}/edit`)}
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
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

    const sourceStatus = result.source.droppableId;
    const destinationStatus = result.destination.droppableId;

    if (sourceStatus === destinationStatus) return;

    try {
      setIsLoading(true);
      await updateClientStatus(result.draggableId, destinationStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-2">
                {firstRowStatuses.map(status => (
                  <div key={status} className="w-1/5 px-1">
                    <div className="rounded-md overflow-hidden" style={{ backgroundColor: getStatusColor(status) }}>
                      <div className="flex items-center justify-between p-2 text-white">
                        <h3 className="text-sm font-semibold">{status}</h3>
                        <div className="bg-white bg-opacity-30 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs">0</div>
                      </div>
                    </div>
                    <div className="mt-1 bg-white rounded-md p-1 min-h-[150px] max-h-[300px] overflow-y-auto border border-gray-100">
                      <div className="animate-pulse">
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
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
              <div className="flex">
                {secondRowStatuses.map(status => (
                  <div key={status} className="w-1/5 px-1">
                    <div className="rounded-md overflow-hidden" style={{ backgroundColor: getStatusColor(status) }}>
                      <div className="flex items-center justify-between p-2 text-white">
                        <h3 className="text-sm font-semibold">{status}</h3>
                        <div className="bg-white bg-opacity-30 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs">0</div>
                      </div>
                    </div>
                    <div className="mt-1 bg-white rounded-md p-1 min-h-[150px] max-h-[300px] overflow-y-auto border border-gray-100">
                      <div className="animate-pulse">
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="w-full">
        <CardContent className="p-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-2">
              <div className="flex">
                {firstRowStatuses.map(renderStatusColumn)}
              </div>
              <div className="flex">
                {secondRowStatuses.map(renderStatusColumn)}
              </div>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientKanban;
