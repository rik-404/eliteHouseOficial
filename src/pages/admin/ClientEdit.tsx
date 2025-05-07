import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '../../types/client';

const ClientEdit = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [status, setStatus] = useState<Client['status']>('Novo');

  const handleBack = () => {
    navigate('/admin/clients');
  };

  const statuses = [
    { value: 'Novo', label: 'Novo' },
    { value: 'Atendimento', label: 'Atendimento' },
    { value: 'Análise documental', label: 'Análise documental' },
    { value: 'Análise bancária', label: 'Análise bancária' },
    { value: 'Aprovado', label: 'Aprovado' },
    { value: 'Condicionado', label: 'Condicionado' },
    { value: 'Reprovado', label: 'Reprovado' },
    { value: 'Venda realizada', label: 'Venda realizada' },
    { value: 'Distrato', label: 'Distrato' },
  ];

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar corretores
        const { data: brokersData, error: brokersError } = await supabase
          .from('users')
          .select('id, username, name')
          .eq('role', 'corretor');
        
        if (brokersError) {
          console.error('Erro ao buscar corretores:', brokersError);
          throw brokersError;
        }

        // Buscar o corretor selecionado do cliente
        if (client?.broker_id) {
          const { data: selectedBrokerData, error: brokerError } = await supabase
            .from('users')
            .select('id, username, name')
            .eq('username', client.broker_id)
            .single();

          if (brokerError) {
            console.error('Erro ao buscar corretor selecionado:', brokerError);
          } else if (selectedBrokerData) {
            console.log('Corretor selecionado encontrado:', selectedBrokerData);
            // Adicionar o corretor selecionado ao início da lista
            setBrokers([selectedBrokerData, ...(brokersData || [])]);
          }
        } else {
          setBrokers(brokersData || []);
        }

        // Buscar cliente
        if (id) {
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

          if (clientError) {
            throw clientError;
          }

          setClient(clientData);
          setStatus(clientData.status);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client) {
      setError('Cliente não encontrado');
      return;
    }

    try {
      // Se for dev, pode editar qualquer cliente
      if (user?.role === 'dev') {
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            ...client,
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', client.id);

        if (updateError) {
          throw updateError;
        }
      } else if (user?.role === 'corretor') {
        setError('Corretores não podem editar clientes');
        return;
      } else {
        // Admin pode editar qualquer cliente
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            ...client,
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', client.id);

        if (updateError) {
          throw updateError;
        }
      }

      navigate('/admin/clients');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      setError('Erro ao atualizar cliente');
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/admin/clients')}>
          Voltar para Clientes
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Editar Cliente' : 'Novo Cliente'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={client?.name || ''}
              onChange={(e) => setClient({ ...client!, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={client?.email || ''}
              onChange={(e) => setClient({ ...client!, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={client?.phone || ''}
              onChange={(e) => setClient({ ...client!, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={client?.cpf || ''}
              onChange={(e) => setClient({ ...client!, cpf: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={client?.cep || ''}
              onChange={(e) => setClient({ ...client!, cep: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              value={client?.street || ''}
              onChange={(e) => setClient({ ...client!, street: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={client?.number || ''}
              onChange={(e) => setClient({ ...client!, number: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={client?.neighborhood || ''}
              onChange={(e) => setClient({ ...client!, neighborhood: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={client?.city || ''}
              onChange={(e) => setClient({ ...client!, city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={client?.state || ''}
              onChange={(e) => setClient({ ...client!, state: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={client?.complement || ''}
              onChange={(e) => setClient({ ...client!, complement: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="broker_id">Corretor</Label>
            {user?.role === 'corretor' ? (
              <div className="text-gray-500">
                Corretor: {user?.username || 'Não encontrado'}
              </div>
            ) : (
              <Select
                value={client?.broker_id || ''}
                onValueChange={(value) => {
                  setClient(prev => prev ? { ...prev, broker_id: value } : null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um corretor" />
                </SelectTrigger>
                <SelectContent>
                  {brokers.map((broker) => (
                    <SelectItem key={broker.id} value={broker.username}>
                      {broker.name || broker.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as Client['status']);
                setClient({ ...client!, status: value as Client['status'] });
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={client?.notes || ''}
              onChange={(e) => setClient({ ...client!, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white">
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientEdit;
