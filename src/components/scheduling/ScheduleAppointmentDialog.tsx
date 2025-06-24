import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/TempAuthContext';
import CustomForm from '@/components/ui/CustomForm';

interface ScheduleAppointmentDialogProps {
  clientId: string;
  clientName: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export const ScheduleAppointmentDialog = ({
  clientId,
  clientName,
  onSuccess,
  children
}: ScheduleAppointmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brokerId, setBrokerId] = useState('');
  const [brokers, setBrokers] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        let query = supabase
          .from('users')
          .select('id, name, broker_id')
          .eq('role', 'corretor')
          .order('name');

        // Se for um corretor, busca apenas o próprio usuário
        if (user?.role === 'corretor') {
          query = query.eq('id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;
        setBrokers(data || []);
        
        // Se houver apenas um corretor, seleciona automaticamente
        if (data?.length === 1) {
          setBrokerId(data[0].broker_id);
        }
      } catch (err) {
        console.error('Erro ao carregar corretores:', err);
        setError('Erro ao carregar lista de corretores');
      }
    };

    if (open) {
      fetchBrokers();
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !title || !brokerId) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Combina a data e hora em um único objeto Date
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { data, error } = await supabase
        .from('scheduling')
        .insert([
          {
            titulo: title,
            descricao: description,
            data: scheduledAt.toISOString().split('T')[0],
            hora: time,
            broker_id: brokerId,
            client_id: clientId,
            status: 'Agendado'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Atualiza o status do cliente para 'Aguardando'
      const { error: clientError } = await supabase
        .from('clients')
        .update({ scheduling: 'Aguardando' })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // Fecha o popup e chama a função de sucesso, se fornecida
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Erro ao agendar:', err);
      setError('Erro ao criar agendamento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-6" align="end">
        <h3 className="text-lg font-semibold mb-4">Agendar Visita</h3>
        <p className="text-sm text-gray-600 mb-4">
          Cliente: <span className="font-medium">{clientName}</span>
        </p>
        
        <CustomForm onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Visita ao empreendimento"
              required
            />
          </div>
          
          <div>
            <Label>Data <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="time">Horário <span className="text-red-500">*</span></Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="broker">Corretor <span className="text-red-500">*</span></Label>
            <select
              id="broker"
              value={brokerId}
              onChange={(e) => setBrokerId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Selecione um corretor</option>
              {brokers.map((broker) => (
                <option key={broker.id} value={broker.broker_id}>
                  {broker.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes sobre o agendamento"
              rows={3}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Agendar'}
            </Button>
          </div>
        </CustomForm>
      </PopoverContent>
    </Popover>
  );
};
