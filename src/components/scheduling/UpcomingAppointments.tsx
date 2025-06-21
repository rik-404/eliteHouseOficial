import React, { useEffect, useState, useCallback } from 'react';
import { format, parseISO, isToday, isTomorrow, isAfter, parse } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { ptBR } from 'date-fns/locale';
import { Loader2, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScheduleAppointmentDialog } from './ScheduleAppointmentDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


interface Appointment {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  hora: string;
  status?: 'Agendado' | 'Realizado' | 'Nao_Realizado';
  client_id: string;
  broker_id: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  broker: {
    id: string;
    name: string;
    username?: string;
    email?: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  broker_id?: string;
}

const UpcomingAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [overdueAppointments, setOverdueAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOverdue, setShowOverdue] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState<string>('');
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');

  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleNewTask = () => {
    navigate('/admin/tasks/new');
  };

  useEffect(() => {
    console.log('=== Iniciando busca do usuário atual ===');

    const loadUserFromLocalStorage = () => {
      try {
        const userData = localStorage.getItem('currentUser');

        if (!userData) {
          console.log('Nenhum usuário encontrado no localStorage');
          return;
        }

        const parsedUser = JSON.parse(userData);
        console.log('Usuário encontrado no localStorage:', parsedUser);

        if (parsedUser && parsedUser.id) {
          const userObj = {
            id: parsedUser.id.toString(),
            name: parsedUser.name || parsedUser.email?.split('@')[0] || 'Usuário',
            email: parsedUser.email || '',
            role: parsedUser.role || 'user',
            broker_id: parsedUser.broker_id
          };

          console.log('Usuário carregado com sucesso:', userObj);
          setUser(userObj);
        } else {
          console.log('Dados do usuário incompletos no localStorage');
        }
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
      }
    };

    if (!user) {
      loadUserFromLocalStorage();
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        loadUserFromLocalStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);

        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const todayStr = today.toISOString().split('T')[0];
        const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

        // Busca agendamentos atrasados
        let query = supabase
          .from('scheduling')
          .select('*')
          .eq('status', 'Agendado')
          .lte('data', todayStr)
          .or(`and(data.eq.${todayStr},hora.lt.${currentTime}),data.lt.${todayStr}`);

        // Se o usuário for um corretor, filtra apenas os agendamentos dele
        if (user?.role === 'corretor' && user.id) {
          console.log('Filtrando agendamentos atrasados apenas para o corretor:', user.id);
          query = query.eq('broker_id', user.id);
        }

        const { data: overdueData, error: overdueError } = await query
          .order('data', { ascending: true })
          .order('hora', { ascending: true });

        if (overdueError) throw overdueError;

        // Se não houver agendamentos atrasados, retorna array vazio
        if (!overdueData || overdueData.length === 0) {
          setOverdueAppointments([]);
          return;
        }

        // Busca clientes e corretores para os agendamentos atrasados
        const overdueClientIds = [...new Set(overdueData
          .map(item => item.client_id)
          .filter((id): id is string => !!id && id !== 'null' && id !== 'undefined')
        )];
        
        const overdueBrokerIds = [...new Set(overdueData
          .map(item => item.broker_id)
          .filter((id): id is string => !!id && id !== 'null' && id !== 'undefined')
        )];

        console.log('IDs de clientes para buscar:', overdueClientIds);
        console.log('IDs de corretores para buscar:', overdueBrokerIds);

        // Inicializa as variáveis para os resultados
        let overdueClients: any[] = [];
        let overdueBrokers: any[] = [];
        let overdueClientsError = null;
        let overdueBrokersError = null;

        // Só busca clientes se houver IDs válidos
        if (overdueClientIds.length > 0) {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .in('id', overdueClientIds);
          
          if (error) {
            console.error('Erro ao buscar clientes atrasados:', error);
            overdueClientsError = error;
          } else {
            overdueClients = data || [];
          }
        }

        // Só busca corretores se houver IDs válidos
        if (overdueBrokerIds.length > 0) {
          console.log('Buscando corretores com broker_ids:', overdueBrokerIds);
          try {
            // Primeiro busca os usuários que são corretores
            const { data: corretores, error } = await supabase
              .from('users')
              .select('*')
              .eq('role', 'corretor');
            
            if (error) {
              console.error('Erro ao buscar corretores atrasados:', error);
              overdueBrokersError = error;
            } else {
              // Filtra os corretores cujo broker_id está na lista de IDs
              const corretoresFiltrados = corretores.filter(corretor => 
                overdueBrokerIds.includes(corretor.broker_id)
              );
              
              console.log('Corretores encontrados:', corretoresFiltrados);
              overdueBrokers = corretoresFiltrados;
            }
          } catch (err) {
            console.error('Exceção ao buscar corretores:', err);
            overdueBrokersError = err;
          }
        }

        if (overdueClientsError || overdueBrokersError) {
          console.error('Erro ao buscar dados para agendamentos atrasados:', { overdueClientsError, overdueBrokersError });
          throw new Error('Erro ao carregar dados dos agendamentos atrasados');
        }

        // Mapeia os agendamentos atrasados com seus respectivos clientes e corretores
        const formattedOverdueAppointments = overdueData.map(appointment => {
          const client = overdueClients?.find(c => c.id === appointment.client_id);
          // Busca o corretor pelo broker_id do agendamento
          const broker = overdueBrokers?.find(b => b.broker_id === appointment.broker_id);

          console.log('Mapeando agendamento:', {
            appointmentId: appointment.id,
            appointmentBrokerId: appointment.broker_id,
            foundBroker: broker
          });

          return {
            ...appointment,
            client: {
              id: client?.id || appointment.client_id,
              name: client?.name || 'Cliente não encontrado',
              email: client?.email || '',
              phone: client?.phone || ''
            },
            broker: {
              id: broker?.id || appointment.broker_id,
              name: broker?.name || broker?.username || 'Corretor não encontrado',
              username: broker?.username || '',
              email: broker?.email || ''
            }
          };
        });

        setOverdueAppointments(formattedOverdueAppointments as Appointment[]);

        let queryUpcoming = supabase
          .from('scheduling')
          .select('*')
          .eq('status', 'Agendado')
          .or(`and(data.eq.${todayStr},hora.gte.${currentTime}),data.gt.${todayStr}`)
          .lte('data', nextWeek.toISOString().split('T')[0]);

        // Se o usuário for um corretor, filtra apenas os agendamentos dele
        if (user?.role === 'corretor' && user.id) {
          console.log('Filtrando agendamentos futuros apenas para o corretor:', user.id);
          queryUpcoming = queryUpcoming.eq('broker_id', user.id);
        }

        const { data: schedulingData, error: schedulingError } = await queryUpcoming
          .order('data', { ascending: true })
          .order('hora', { ascending: true });

        if (schedulingError) throw schedulingError;

        if (!schedulingData || schedulingData.length === 0) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const clientIds = [...new Set(schedulingData
          .map(item => item.client_id)
          .filter((id): id is string => !!id && id !== 'null' && id !== 'undefined')
        )];

        const brokerIds = [...new Set(schedulingData
          .map(item => item.broker_id)
          .filter((id): id is string => !!id && id !== 'null' && id !== 'undefined')
        )];

        console.log('IDs de clientes para buscar (próximos):', clientIds);
        console.log('IDs de corretores para buscar (próximos):', brokerIds);

        // Inicializa as variáveis para os resultados
        let clients: any[] = [];
        let brokers: any[] = [];

        // Só busca clientes se houver IDs válidos
        if (clientIds.length > 0) {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .in('id', clientIds);
          
          if (error) {
            console.error('Erro ao buscar clientes (próximos):', error);
          } else {
            clients = data || [];
          }
        }


        // Só busca corretores se houver IDs válidos
        if (brokerIds.length > 0) {
          console.log('Buscando corretores (próximos) com broker_ids:', brokerIds);
          try {
            // Primeiro busca todos os corretores
            const { data: corretores, error } = await supabase
              .from('users')
              .select('*')
              .eq('role', 'corretor');
            
            if (error) {
              console.error('Erro ao buscar corretores (próximos):', error);
            } else {
              // Filtra os corretores cujo broker_id está na lista de IDs
              const corretoresFiltrados = corretores.filter(corretor => 
                brokerIds.includes(corretor.broker_id)
              );
              
              console.log('Corretores (próximos) encontrados:', corretoresFiltrados);
              brokers = corretoresFiltrados;
            }
          } catch (err) {
            console.error('Exceção ao buscar corretores (próximos):', err);
          }
        }

        console.log('Clientes encontrados:', clients);
        console.log('Corretores encontrados:', brokers);

        const appointmentsData = schedulingData.map(appointment => {
          const client = clients?.find(c => c.id === appointment.client_id);
          const broker = brokers?.find(b => b.id === appointment.broker_id);

          return {
            ...appointment,
            client: {
              id: client?.id || appointment.client_id,
              name: client?.name || 'Cliente não encontrado',
              email: client?.email || '',
              phone: client?.phone || ''
            },
            broker: {
              id: broker?.id || appointment.broker_id,
              name: broker?.name || broker?.username || 'Corretor não encontrado',
              username: broker?.username || '',
              email: broker?.email || ''
            }
          };
        });

        const now = new Date();
        const filteredAppointments = appointmentsData.filter(appointment => {
          const appointmentDate = new Date(`${appointment.data}T${appointment.hora}`);
          return isAfter(appointmentDate, now) || isToday(appointmentDate);
        });

        setAppointments(filteredAppointments);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleUpdateAppointmentStatus = useCallback(async (appointmentId: string, newStatus: 'Agendado' | 'Realizado' | 'Nao_Realizado'): Promise<boolean> => {
    console.log('Iniciando atualização de status:', {
      appointmentId,
      newStatus,
      currentUser: user
    });

    if (!user) {
      console.error('Nenhum usuário autenticado');
      alert('Você precisa estar logado para atualizar o status do agendamento.');
      return false;
    }

    const hasPermission = ['admin', 'dev', 'corretor'].includes(user.role || '');

    console.log('Verificação de permissão:', {
      userRole: user.role,
      hasPermission,
      userId: user.id
    });

    if (!hasPermission) {
      console.error('Usuário sem permissão para atualizar status. Role atual:', user.role);
      alert('Você não tem permissão para atualizar o status do agendamento.');
      return false;
    }

    try {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: true }));

      const { data: appointmentData, error: fetchError } = await supabase
        .from('scheduling')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar agendamento:', fetchError);
        throw fetchError;
      }

      if (!appointmentData) {
        const errorMsg = 'Agendamento não encontrado';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const clientId = appointmentData.client_id;
      console.log('Dados do agendamento encontrado:', { clientId, statusAtual: appointmentData.status });

      const { data: updatedScheduling, error: updateSchedulingError } = await supabase
        .from('scheduling')
        .update({ status: newStatus })
        .eq('id', appointmentId)
        .select();

      if (updateSchedulingError) {
        console.error('Erro ao atualizar scheduling:', updateSchedulingError);
        throw updateSchedulingError;
      }
      console.log('Scheduling atualizado com sucesso:', updatedScheduling);

      const { data: updatedClient, error: updateClientError } = await supabase
        .from('clients')
        .update({ scheduling: newStatus, updated_at: new Date().toISOString() })
        .eq('id', clientId)
        .select();

      if (updateClientError) {
        console.error('Erro ao atualizar cliente:', updateClientError);
        throw updateClientError;
      }
      console.log('Cliente atualizado com sucesso:', updatedClient);

      setAppointments(prev => {
        const updated = prev.map(appt =>
          appt.id === appointmentId
            ? { ...appt, status: newStatus, client: { ...appt.client, scheduling: newStatus } }
            : appt
        );
        console.log('Estado local atualizado:', updated);
        return updated;
      });

      setRefreshKey(prev => prev + 1);

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Ocorreu um erro ao atualizar o status. Por favor, tente novamente.');
      return false;
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: false }));
    }
  }, [user]);

  const isAdminOrDev = user && (user.role === 'admin' || user.role === 'dev');

  const handleReschedule = async () => {
    if (!rescheduleAppointment || !newAppointmentDate || !newAppointmentTime) return;

    try {
      const { error } = await supabase
        .from('scheduling')
        .update({
          data: newAppointmentDate,
          hora: newAppointmentTime,
          status: 'Agendado',
          updated_at: new Date().toISOString()
        })
        .eq('id', rescheduleAppointment.id);

      if (error) throw error;

      // Atualiza a lista de agendamentos
      setRefreshKey(prev => prev + 1);
      setRescheduleAppointment(null);
      setNewAppointmentDate('');
      setNewAppointmentTime('');
      
      alert('Agendamento remarcado com sucesso!');
    } catch (error) {
      console.error('Erro ao remarcar agendamento:', error);
      alert('Erro ao remarcar agendamento. Tente novamente.');
    }
  };

  // Filtra os agendamentos para mostrar apenas os do corretor logado
  const filteredAppointments = React.useMemo(() => {
    if (user?.role === 'corretor' && user.broker_id) {
      return appointments.filter(appt => appt.broker_id === user.broker_id);
    }
    return appointments;
  }, [user, appointments]);

  // Filtra os agendamentos atrasados para mostrar apenas os do corretor logado
  const filteredOverdueAppointments = React.useMemo(() => {
    if (user?.role === 'corretor' && user.broker_id) {
      return overdueAppointments.filter(appt => appt.broker_id === user.broker_id);
    }
    return overdueAppointments;
  }, [user, overdueAppointments]);

  const renderAppointmentCard = (appointment: Appointment, isOverdue = false) => {
    return (
      <div
        key={appointment.id}
        className={`border rounded-lg p-4 ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-white'}`}
      >
        {isOverdue && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Atrasado
            </span>
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{appointment.titulo}</h3>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(appointment.data), "EEEE, d 'de' MMMM", { locale: ptBR })}
              {' • '}
              {appointment.hora}
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm">
                <span className="font-medium w-16">Cliente:</span>
                <span className="ml-1">{appointment.client?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="font-medium w-16">Corretor:</span>
                <span className="ml-1">
                  {appointment.broker?.name || appointment.broker?.username || 'N/A'}
                </span>
              </div>
              {isOverdue && (isAdminOrDev || user?.role === 'corretor') && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRescheduleAppointment(appointment);
                      setNewAppointmentDate(appointment.data);
                      setNewAppointmentTime(appointment.hora);
                    }}
                  >
                    Remarcar
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={
                appointment.status === 'Agendado' ? 'default' : 
                appointment.status === 'Realizado' ? 'outline' : 'destructive'
              }
              className={appointment.status === 'Realizado' ? 'bg-green-100 text-green-800 border-green-200' : ''}
            >
              {appointment.status === 'Agendado' ? 'Agendado' : 
               appointment.status === 'Realizado' ? 'Realizado' : 'Não Realizado'}
            </Badge>
          </div>
        </div>
        {appointment.descricao && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              {appointment.descricao}
            </p>
          </div>
        )}
        <div className="flex justify-end items-center mt-3">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setSelectedAppointment(appointment);
              setIsStatusDialogOpen(true);
            }}
            disabled={updatingStatus[appointment.id]}
          >
            {updatingStatus[appointment.id] ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Atualizar status
          </Button>
        </div>
      </div>
    );
  };

  // Diálogo de Remarcação
  const renderRescheduleDialog = () => (
    <AlertDialog open={!!rescheduleAppointment} onOpenChange={(open) => !open && setRescheduleAppointment(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remarcar Agendamento</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione a nova data e horário para o agendamento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nova Data</Label>
            <Input
              type="date"
              value={newAppointmentDate}
              onChange={(e) => setNewAppointmentDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Novo Horário</Label>
            <Input
              type="time"
              value={newAppointmentTime}
              onChange={(e) => setNewAppointmentTime(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setRescheduleAppointment(null)}>
            Cancelar
          </Button>
          <Button onClick={handleReschedule} disabled={!newAppointmentDate || !newAppointmentTime}>
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="space-y-6">
      {/* Seção de Tarefas Atrasadas */}
      {filteredOverdueAppointments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-red-700">
                {user?.role === 'corretor' ? 'Minhas Tarefas Atrasadas' : 'Tarefas Atrasadas'}
                <Badge variant="destructive" className="ml-2">
                  {filteredOverdueAppointments.length}
                </Badge>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 relative"
                onClick={() => setShowOverdue(!showOverdue)}
              >
                {showOverdue ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                )}
              </Button>
            </div>
          </CardHeader>
          {showOverdue && (
            <CardContent>
              <div className="space-y-3">
                {filteredOverdueAppointments.map(appointment => renderAppointmentCard(appointment, true))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              {user?.role === 'corretor' ? 'Minhas Próximas Tarefas' : 'Próximas Tarefas'}
            </CardTitle>
            {(user?.role === 'admin' || user?.role === 'dev') && (
              <Button 
                size="sm" 
                onClick={handleNewTask}
                className="ml-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 relative"
              onClick={() => setShowUpcoming(!showUpcoming)}
            >
              {showUpcoming ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum agendamento encontrado para os próximos dias.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map(appointment => renderAppointmentCard(appointment, false))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmação de status */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar status do agendamento</AlertDialogTitle>
            <div className="flex flex-col space-y-2">
              <AlertDialogDescription asChild>
                <span className="font-medium block">{selectedAppointment?.titulo}</span>
              </AlertDialogDescription>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                {selectedAppointment?.client?.name} • {selectedAppointment?.data ? format(parseISO(selectedAppointment.data), "EEEE, d 'de' MMMM", { locale: ptBR }) : ''} • {selectedAppointment?.hora || ''}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          
          <div className="grid gap-3 py-4">
            <div className="text-sm text-muted-foreground mb-2">
              Selecione o novo status:
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-start h-12 px-4 py-2 hover:bg-green-50 hover:text-green-700"
                onClick={async () => {
                  if (selectedAppointment) {
                    await handleUpdateAppointmentStatus(selectedAppointment.id, 'Realizado');
                    setIsStatusDialogOpen(false);
                  }
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">Realizado</div>
                    <div className="text-xs text-muted-foreground">O agendamento foi concluído com sucesso</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start h-12 px-4 py-2 hover:bg-red-50 hover:text-red-700"
                onClick={async () => {
                  if (selectedAppointment) {
                    await handleUpdateAppointmentStatus(selectedAppointment.id, 'Nao_Realizado');
                    setIsStatusDialogOpen(false);
                  }
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">Não Realizado</div>
                    <div className="text-xs text-muted-foreground">O agendamento não pôde ser realizado</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de remarcação */}
      {renderRescheduleDialog()}
    </div>
  );
};

// Exportação nomeada para uso com import { UpcomingAppointments }
export { UpcomingAppointments };

export default UpcomingAppointments;
