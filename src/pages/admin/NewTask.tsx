import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import CustomForm from '@/components/ui/CustomForm';

export const NewTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Redireciona para o login se não estiver autenticado
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);
  
  // Se não tem usuário, não renderiza nada
  if (!user) {
    return null;
  }
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brokerId, setBrokerId] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    // Não carrega dados se não tiver usuário
    if (!user) return;
    
    const loadData = async () => {
      try {
        // Buscar corretores - usa broker_id como id
        let brokersQuery = supabase
          .from('users')
          .select('broker_id, name')
          .eq('role', 'corretor')
          .order('name');

        // Se for um corretor, busca apenas o próprio usuário
        if (user?.role === 'corretor') {
          brokersQuery = brokersQuery.eq('broker_id', user.id);
        }

        // Buscar clientes
        const clientsQuery = supabase
          .from('clients')
          .select('id, name')
          .order('name');

        const [
          { data: brokersData, error: brokersError },
          { data: clientsData, error: clientsError }
        ] = await Promise.all([
          brokersQuery,
          clientsQuery
        ]);

        if (brokersError) throw brokersError;
        if (clientsError) throw clientsError;

        setBrokers(brokersData || []);
        setClients(clientsData || []);

        // Definir o primeiro corretor como padrão se disponível
        if (brokersData?.length > 0) {
          // Usa o broker_id como ID
          setBrokerId(brokersData[0].broker_id);
        }

        // Cliente inicia como nenhum por padrão
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar dados. Tente novamente.');
      }
    };

    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    const errors = [];
    if (!title) errors.push('título');
    if (!date) errors.push('data');
    if (!time) errors.push('hora');
    if (!brokerId) errors.push('corretor');
    // Cliente é opcional, então não adicionamos ao array de erros
    
    if (errors.length > 0) {
      setError(`Por favor, preencha os seguintes campos obrigatórios: ${errors.join(', ')}`);
      return;
    }
    
    // Verifica se a hora é válida
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      setError('Por favor, insira uma hora válida.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Formatar data e hora (já validadas anteriormente)
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Define a interface para o objeto taskData
      interface TaskData {
        titulo: string;
        descricao: string | null;
        data: string;
        hora: string;
        status: string;
        broker_id: string;
        client_id?: string | null; // Propriedade opcional
      }

      // Garante que o status seja sempre 'Agendado' ao criar uma nova tarefa
      // Garante que brokerId seja uma string
      const brokerIdStr = String(brokerId);
      console.log('IDs antes do envio:', { brokerId, brokerIdStr, clientId });
      
      const taskData: TaskData = {
        titulo: title.trim(),
        descricao: description?.trim() || null,
        data: formattedDate,
        hora: time,
        status: 'Agendado', // Status fixo para novas tarefas
        broker_id: brokerIdStr // Garante que é uma string
      };

      // Adiciona o client_id apenas se um cliente foi selecionado
      if (clientId) {
        taskData.client_id = String(clientId);
      }

      console.log('Enviando dados da tarefa:', taskData);
      
      // Insere a tarefa no banco de dados
      const { data, error } = await supabase
        .from('scheduling')
        .insert([{
          ...taskData,
          // O banco de dados irá preencher automaticamente created_at e updated_at
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      console.log('Tarefa criada com sucesso:', data);
      
      // Limpa o formulário
      setTitle('');
      setDescription('');
      setTime('');
      setDate(new Date());
      setError(null);
      
      // Exibe a mensagem de sucesso
      toast.success('Tarefa criada com sucesso!');
      
      // Redireciona para /admin após 1 segundo
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (error) {
      console.error('Erro ao agendar tarefa:', error);
      setError('Erro ao agendar tarefa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nova Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomForm onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da tarefa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Data *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border w-full pl-10"
                    locale={ptBR}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="broker">Corretor *</Label>
                <select
                  id="broker"
                  value={brokerId}
                  onChange={(e) => setBrokerId(String(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={user?.role === 'corretor'}
                  required
                >
                  {brokers.map((broker) => (
                    <option key={broker.broker_id} value={broker.broker_id}>
                      {broker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente (opcional)</Label>
                <select
                  id="client"
                  value={clientId || ''}
                  onChange={(e) => setClientId(e.target.value ? String(e.target.value) : null)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Nenhum cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição detalhada da tarefa"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="min-w-[120px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  'Salvar Tarefa'
                )}
              </Button>
            </div>
          </CustomForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTask;
