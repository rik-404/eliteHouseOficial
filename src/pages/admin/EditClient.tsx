import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, CalendarPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScheduleAppointmentDialog } from '@/components/scheduling/ScheduleAppointmentDialog';

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

type ClientStatus = 'Novo' | 'Atendimento' | 'Análise documental' | 'Análise bancária' | 'Aprovado' | 'Condicionado' | 'Reprovado' | 'Venda realizada' | 'Distrato';



const EditClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noBrokers, setNoBrokers] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title')
          .order('title');

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Erro ao carregar propriedades:', error);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadClient = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setClient(data);

        // Verificar permissões se o status for Análise bancária, Aprovado, Condicionado ou Reprovado
        if (data.status === 'Análise bancária' || data.status === 'Aprovado' || data.status === 'Condicionado' || data.status === 'Reprovado') {
          if (user?.role === 'corretor') {
            setShowPermissionError(true);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar cliente:', error);
        setError('Erro ao carregar cliente');
      }
    };

    loadClient();
  }, [id, user]);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, name, broker_id')
          .eq('role', 'corretor')
          .order('name');

        if (error) throw error;
        
        const validBrokers = data?.filter((user: any) => user.broker_id) || [];
        setBrokers(validBrokers);
        
        if (validBrokers.length === 0) {
          setNoBrokers(true);
        }
      } catch (err) {
        console.error('Erro ao carregar corretores:', err);
        setError('Erro ao carregar lista de corretores');
      } finally {
        setLoading(false);
      }
    };

    fetchBrokers();
  }, []);

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client) return;

    const cep = e.target.value.replace(/\D/g, '');
    setClient(prev => ({ ...prev, cep }));

    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json() as ViaCEPResponse;

        if (data.erro) {
          setError('CEP não encontrado');
          return;
        }

        setClient(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf
        }));
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
        setError('Erro ao buscar informações do CEP');
      }
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar campos obrigatórios
      if (!client?.name) throw new Error('Nome é obrigatório');
      if (!client?.email) throw new Error('Email é obrigatório');
      if (!client?.phone) throw new Error('Telefone é obrigatório');
      if (!client?.broker_id) throw new Error('Corretor é obrigatório');
      if (!client?.status) throw new Error('Status é obrigatório');

      // Verificar permissões antes de salvar
      if (user?.role === 'corretor' && (client.status === 'Análise bancária' || client.status === 'Aprovado' || client.status === 'Condicionado' || client.status === 'Reprovado')) {
        setError('Você não tem permissão para editar este cliente nesse status');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          cpf: client.cpf,
          email: client.email,
          phone: client.phone,
          cep: client.cep,
          street: client.street,
          number: client.number,
          neighborhood: client.neighborhood,
          city: client.city,
          state: client.state,
          complement: client.complement,
          broker_id: client.broker_id,
          status: client.status,
          notes: client.notes,
          origin: client.origin || null,
          scheduling: client.scheduling || null
        })
        .eq('id', client.id)
        .select()
        .single();

      if (error) throw error;

      navigate('/admin/clients');
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setError('Erro ao atualizar cliente. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent>
            <div className="text-center py-4">Carregando...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent>
            <div className="text-red-500">Cliente não encontrado</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showPermissionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Você não tem permissão para editar este cliente.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Editar Cliente</CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/clients')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={client.name}
                      onChange={(e) => setClient({ ...client, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF (opcional)</Label>
                    <Input
                      id="cpf"
                      value={client.cpf || ''}
                      onChange={(e) => setClient({ ...client, cpf: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="broker_id">Corretor <span className="text-red-500">*</span></Label>
                {user?.role === 'corretor' ? (
                  <div className="text-gray-500">
                    Corretor: {user?.name || user?.username}
                  </div>
                ) : (
                  <Select
                    value={client.broker_id}
                    onValueChange={(value) => setClient({ ...client, broker_id: value })}
                    required
                    disabled={loading || noBrokers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? 'Carregando corretores...' : noBrokers ? 'Nenhum corretor encontrado' : 'Selecionar corretor'} />
                    </SelectTrigger>
                    <SelectContent>
                      {brokers.map((broker) => (
                        <SelectItem key={broker.id} value={broker.broker_id}>
                          {broker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {noBrokers && (
                  <p className="mt-2 text-sm text-red-500">
                    Por favor, cadastre um corretor primeiro
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP (Opcional)</Label>
                <Input
                  id="cep"
                  value={client?.cep || ''}
                  onChange={handleCEPChange}
                  placeholder="Digite o CEP (apenas números)"
                />
              </div>
              <div>
                <Label htmlFor="street">Rua (Opcional)</Label>
                <Input
                  id="street"
                  value={client?.street || ''}
                  onChange={(e) => setClient(prev => prev ? { ...prev, street: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="number">Número (Opcional)</Label>
                <Input
                  id="number"
                  value={client?.number || ''}
                  onChange={(e) => setClient(prev => prev ? { ...prev, number: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro (Opcional)</Label>
                <Input
                  id="neighborhood"
                  value={client?.neighborhood || ''}
                  onChange={(e) => setClient(prev => prev ? { ...prev, neighborhood: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="origin">Origem (Opcional)</Label>
                <Input
                  id="origin"
                  value={client?.origin || ''}
                  onChange={(e) => setClient(prev => prev ? { ...prev, origin: e.target.value } : null)}
                  placeholder="Ex: Site, Indicação, etc."
                />
              </div>
              <div>
                <div className="space-y-2">
                  <Label htmlFor="scheduling">Status do Agendamento</Label>
                  <Select
                    value={client?.scheduling || ''}
                    onValueChange={(value) => {
                      setClient(prev => prev ? { 
                        ...prev, 
                        scheduling: value as 'Aguardando' | 'Não realizada' | 'Realizada' | null 
                      } : null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aguardando">Aguardando</SelectItem>
                      <SelectItem value="Não realizada">Não realizada</SelectItem>
                      <SelectItem value="Realizada">Realizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="complement">Complemento (Opcional)</Label>
                <Input
                  id="complement"
                  value={client?.complement || ''}
                  onChange={(e) => setClient(prev => prev ? { ...prev, complement: e.target.value } : null)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={client.status}
                  onValueChange={(value) => setClient({ ...client, status: value as ClientStatus })}
                  disabled={user?.role === 'corretor' && (client.status === 'Análise bancária' || client.status === 'Aprovado' || client.status === 'Condicionado' || client.status === 'Reprovado')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Novo">Novo</SelectItem>
                    <SelectItem value="Atendimento">Atendimento</SelectItem>
                    <SelectItem value="Análise documental">Análise documental</SelectItem>
                    <SelectItem value="Análise bancária">Análise bancária</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Condicionado">Condicionado</SelectItem>
                    <SelectItem value="Reprovado">Reprovado</SelectItem>
                    <SelectItem value="Venda realizada">Venda realizada</SelectItem>
                    <SelectItem value="Distrato">Distrato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={client?.notes || ''}
                    onChange={(e) => setClient(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    placeholder="Observações sobre o cliente..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="property">Empreendimento</Label>
                  <Select
                    value={client?.properties_id || ''}
                    onValueChange={(value) => {
                      const selectedProperty = properties.find(p => p.id === value);
                      setClient(prev => prev ? {
                        ...prev,
                        properties_id: value,
                        property_name: selectedProperty?.title || null
                      } : null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um empreendimento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum (adicionado manualmente)</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <div>
                {client && (
                  <ScheduleAppointmentDialog 
                    clientId={client.id} 
                    clientName={client.name}
                    onSuccess={() => {
                      // Atualiza o status do cliente para 'Aguardando' após o agendamento
                      setClient(prev => prev ? { ...prev, scheduling: 'Aguardando' } : null);
                    }}
                  >
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Agendar Visita
                    </Button>
                  </ScheduleAppointmentDialog>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClient;
