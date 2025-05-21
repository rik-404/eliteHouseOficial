import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import { useRealtimeAppointments } from '@/lib/useRealtimeAppointments';


interface ClientProfileModalProps {
  client: {
    id: string;
    name: string;
    email?: string;
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
  };
  onClose: () => void;
}

const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ client, onClose }) => {
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const { appointments, loading } = useRealtimeAppointments(client.id);

  return (
    <div>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <h2 className="text-xl font-semibold">{client.name}</h2>
              <p className="text-sm text-gray-500">Status: {client.status}</p>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <h3 className="font-medium mb-2">Informações de Contato</h3>
              <p className="text-sm">Email: {client.email || 'Não informado'}</p>
              <p className="text-sm">Telefone: {client.phone}</p>
              <p className="text-sm">CPF: {client.cpf || 'Não informado'}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Endereço</h3>
              <p className="text-sm">CEP: {client.cep || 'Não informado'}</p>
              <p className="text-sm">Rua: {client.street || 'Não informado'}</p>
              <p className="text-sm">Número: {client.number || 'Não informado'}</p>
              <p className="text-sm">Bairro: {client.neighborhood || 'Não informado'}</p>
              <p className="text-sm">Cidade: {client.city || 'Não informado'}</p>
              <p className="text-sm">Estado: {client.state || 'Não informado'}</p>
              <p className="text-sm">Complemento: {client.complement || 'Não informado'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Observações</h3>
              <p className="text-sm whitespace-pre-wrap">{client.notes || 'Nenhuma observação'}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Agendamentos</h3>
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {appointments.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum agendamento encontrado</p>
                  ) : (
                    appointments.map((appointment) => (
                      <div key={appointment.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{appointment.titulo}</h4>
                            <p className="text-xs text-gray-500">
                              {format(parseISO(appointment.data), 'dd/MM/yyyy')} às {appointment.hora}
                            </p>
                            {appointment.descricao && (
                              <p className="text-xs mt-1">{appointment.descricao}</p>
                            )}
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="outline" className="text-xs">
                              {appointment.status || 'Agendado'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              <span className="text-xs">Atualizar Status</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar Status do Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione o novo status para o agendamento:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsStatusDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await supabase
                    .from('scheduling')
                    .update({ status: 'Realizado' })
                    .eq('id', selectedAppointment?.id);
                  
                  // Atualizar a lista de agendamentos
                  await fetchAppointments();
                  setIsStatusDialogOpen(false);
                } catch (error) {
                  console.error('Erro ao atualizar status:', error);
                }
              }}
            >
              Realizado
            </AlertDialogAction>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await supabase
                    .from('scheduling')
                    .update({ status: 'Nao_Realizado' })
                    .eq('id', selectedAppointment?.id);
                  
                  // Atualizar a lista de agendamentos
                  await fetchAppointments();
                  setIsStatusDialogOpen(false);
                } catch (error) {
                  console.error('Erro ao atualizar status:', error);
                }
              }}
            >
              Não Realizado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientProfileModal;
