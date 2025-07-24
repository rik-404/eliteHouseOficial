import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isBefore, isToday, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { getSchedules } from '@/services/schedulingService';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: getSchedules,
  });

  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.titulo + (event.client?.nome ? ` - ${event.client.nome}` : ''),
      start: new Date(`${event.data}T${event.hora}`),
      end: new Date(new Date(`${event.data}T${event.hora}`).getTime() + 60 * 60 * 1000), // 1 hora de duração
      status: event.status,
      allDay: false,
    }));
  }, [events]);

  const eventStyleGetter = (event: any) => {
    const now = new Date();
    const isOverdue = isBefore(event.start, now) && event.status !== 'Realizado' && event.status !== 'Cancelado';
    
    let backgroundColor = '#3b82f6'; // Azul padrão
    
    if (isOverdue) {
      backgroundColor = '#ef4444'; // Vermelho para atrasados
    } else if (event.status === 'Confirmado') {
      backgroundColor = '#22c55e'; // Verde para confirmados
    } else if (event.status === 'Realizado') {
      backgroundColor = '#6b7280'; // Cinza para realizados
    } else if (event.status === 'Cancelado') {
      backgroundColor = '#f59e0b'; // Amarelo para cancelados
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.8rem',
      },
    };
  };

  const dayPropGetter = useCallback((date: Date) => {
    const dayEvents = calendarEvents.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });

    const hasOverdue = dayEvents.some(event => 
      isBefore(event.start, new Date()) && 
      event.status !== 'Realizado' && 
      event.status !== 'Cancelado'
    );

    const hasScheduled = dayEvents.some(event => 
      !isBefore(event.start, new Date()) || 
      event.status === 'Realizado' || 
      event.status === 'Cancelado'
    );

    const style: React.CSSProperties = {};
    
    if (hasOverdue) {
      style.position = 'relative';
      style.zIndex = 1;
    }

    return {
      className: hasOverdue ? 'has-overdue' : '',
      style,
    };
  }, [calendarEvents]);

  const components = {
    month: {
      dateHeader: (props: any) => {
        const date = new Date(props.date);
        const dayEvents = calendarEvents.filter(event => {
          const eventDate = new Date(event.start);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        });

        const hasOverdue = dayEvents.some(event => 
          isBefore(event.start, new Date()) && 
          event.status !== 'Realizado' && 
          event.status !== 'Cancelado'
        );

        const hasScheduled = dayEvents.some(event => 
          !isBefore(event.start, new Date()) || 
          event.status === 'Realizado' || 
          event.status === 'Cancelado'
        );

        return (
          <div className="relative">
            <div className="text-right pr-2">
              {format(date, 'd')}
            </div>
            <div className="flex justify-center gap-1 mt-1">
              {hasScheduled && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
              {hasOverdue && (
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              )}
            </div>
          </div>
        );
      },
    },
  };

  // Filtrar agendamentos atrasados
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora a partir de agora
  
  const overdueAppointments = calendarEvents.filter(event => 
    isBefore(event.start, now) && 
    event.status !== 'Realizado' && 
    event.status !== 'Cancelado'
  );

  // Filtrar próximos agendamentos (dentro da próxima hora)
  const upcomingAppointments = calendarEvents.filter(event => 
    event.start > now && 
    event.start <= oneHourFromNow &&
    event.status !== 'Cancelado'
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Seção de Avisos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avisos de Atrasados */}
        {overdueAppointments.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {overdueAppointments.length} {overdueAppointments.length === 1 ? 'Agendamento atrasado' : 'Agendamentos atrasados'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {overdueAppointments.slice(0, 3).map(appt => (
                      <li key={appt.id}>
                        {appt.title} - {format(appt.start, 'HH:mm')}
                      </li>
                    ))}
                    {overdueAppointments.length > 3 && (
                      <li>e mais {overdueAppointments.length - 3} agendamentos...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avisos de Próximos */}
        {upcomingAppointments.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Próximos agendamentos (1h)
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {upcomingAppointments.slice(0, 3).map(appt => (
                      <li key={appt.id}>
                        {appt.title} - {format(appt.start, 'HH:mm')}
                      </li>
                    ))}
                    {upcomingAppointments.length > 3 && (
                      <li>e mais {upcomingAppointments.length - 3} agendamentos...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de Visitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] mt-4">
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              defaultView={Views.MONTH}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              messages={{
                next: 'Próximo',
                previous: 'Anterior',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Lista',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Nenhum agendamento neste período.',
              }}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              components={components}
              onNavigate={(date) => setCurrentDate(date)}
              date={currentDate}
              culture="pt-BR"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
