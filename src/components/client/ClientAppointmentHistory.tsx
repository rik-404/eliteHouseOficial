import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Appointment {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  hora: string;
  status?: 'Agendado' | 'Realizado' | 'Nao_Realizado';
  client_id: string;
  broker_id: string;
  broker?: any; // Usando any para evitar problemas de tipagem com o retorno do Supabase
}

interface ClientAppointmentHistoryProps {
  clientId: string;
}

const ClientAppointmentHistory: React.FC<ClientAppointmentHistoryProps> = ({ clientId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [clientId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('scheduling')
        .select(`
          id, 
          titulo, 
          descricao, 
          data, 
          hora, 
          status, 
          client_id, 
          broker_id
        `)
        .eq('client_id', clientId)
        .order('data', { ascending: false })
        .order('hora', { ascending: false });
        
      // Buscar dados do corretor separadamente se necessário
      let schedulingData = data || [];
      if (schedulingData.length > 0) {
        // Obter todos os IDs de corretores únicos
        const brokerIds = [...new Set(schedulingData.map(item => item.broker_id))];
        
        // Buscar informações dos corretores
        for (const brokerId of brokerIds) {
          const { data: brokerData } = await supabase
            .from('users')
            .select('id, name')
            .eq('id', brokerId)
            .single();
            
          // Adicionar informações do corretor aos agendamentos
          if (brokerData) {
            schedulingData = schedulingData.map(item => {
              if (item.broker_id === brokerId) {
                return { ...item, broker: brokerData };
              }
              return item;
            });
          }
        }
      }

      if (error) {
        throw error;
      }

      setAppointments(schedulingData);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setError('Não foi possível carregar o histórico de agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'Agendado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Realizado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Nao_Realizado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status?: string) => {
    switch (status) {
      case 'Agendado':
        return 'Agendado';
      case 'Realizado':
        return 'Realizado';
      case 'Nao_Realizado':
        return 'Não Realizado';
      default:
        return 'Pendente';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando agendamentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Nenhum agendamento encontrado para este cliente.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-1">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">{appointment.titulo}</h3>
                  <Badge className={getStatusBadgeStyle(appointment.status)}>
                    {formatStatus(appointment.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Data: </span>
                    <span>{formatDate(appointment.data)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Hora: </span>
                    <span>{appointment.hora}</span>
                  </div>
                </div>
                
                {appointment.descricao && (
                  <div className="mt-2">
                    <span className="text-gray-500 block text-sm">Descrição:</span>
                    <p className="text-sm mt-1">{appointment.descricao}</p>
                  </div>
                )}
                
                {appointment.broker && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Corretor: </span>
                    <span>{appointment.broker.name}</span>
                  </div>
                )}
                
                {/* Removida a exibição de created_at e updated_at que não estão na tabela */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ClientAppointmentHistory;
