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
        
        // Buscar corretor
        const { data: brokersData } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'broker');
        
        setBrokers(brokersData || []);

        // Se for um cliente existente, buscar os dados
        if (id) {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          setClient(data);
          setStatus(data.status);
        }
      } catch (err) {
        setError('Erro ao carregar cliente');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .upsert({
          ...client,
          status,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      navigate('/admin/clients');
    } catch (err) {
      setError('Erro ao salvar cliente');
      console.error(err);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Editar Cliente' : 'Novo Cliente'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={client?.cpf || ''}
            onChange={(e) => setClient({ ...client!, cpf: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="notes">Observações</Label>
          <Input
            id="notes"
            value={client?.notes || ''}
            onChange={(e) => setClient({ ...client!, notes: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="broker_id">Corretor</Label>
          <Select
            value={client?.broker_id || ''}
            onValueChange={(value) => setClient({ ...client!, broker_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar corretor" />
            </SelectTrigger>
            <SelectContent>
              {brokers.map((broker) => (
                <SelectItem key={broker.id} value={broker.id}>
                  {broker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={client?.status || ''}
            onValueChange={(value) => {
              setClient({ ...client!, status: value as Client['status'] });
              setStatus(value as Client['status']);
            }}
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
        <Button type="submit">Salvar</Button>
      </form>
    </div>
  );
};

export default ClientEdit;
