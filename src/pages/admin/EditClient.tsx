import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

type ClientStatus = 'Novo' | 'Atendimento' | 'Análise documental' | 'Análise bancária' | 'Aprovado' | 'Condicionado' | 'Reprovado' | 'Venda realizada' | 'Distrato';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  broker_id: string;
  status: ClientStatus;
  notes: string;
}

const EditClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [client, setClient] = useState<Client | null>(null);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noBrokers, setNoBrokers] = useState(false);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (err) {
      console.error('Erro ao carregar cliente:', err);
      setError('Erro ao carregar cliente. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();

    // Configurar escuta em tempo real
    const channel = supabase
      .channel('client-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Change received for client:', payload);
          fetchClient();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id]);

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
    if (!client) return;

    setLoading(true);
    setError(null);

    try {
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
          notes: client.notes
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Editar Cliente</CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/clients')}
              className="text-gray-700 hover:text-gray-900"
            >
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label>
                <Input
                  id="cpf"
                  value={client.cpf}
                  onChange={(e) => setClient({ ...client, cpf: e.target.value })}
                  required
                />
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
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={client.cep}
                  onChange={handleCEPChange}
                  placeholder="Digite o CEP (apenas números)"
                />
              </div>
              <div>
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={client.street}
                  onChange={(e) => setClient({ ...client, street: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={client.number}
                  onChange={(e) => setClient({ ...client, number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={client.neighborhood}
                  onChange={(e) => setClient({ ...client, neighborhood: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={client.city}
                  onChange={(e) => setClient({ ...client, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={client.state}
                  onChange={(e) => setClient({ ...client, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={client.complement}
                  onChange={(e) => setClient({ ...client, complement: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={client.notes}
                  onChange={(e) => setClient({ ...client, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {loading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClient;
