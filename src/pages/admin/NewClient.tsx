import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
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
  origin: string;
  broker_id: string;
  status: ClientStatus;
  notes: string;
  scheduling?: string;
}

export const NewClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Inicializar o estado do cliente com o broker_id do usuário corretor
  const initialClient: Client = {
    id: '',
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    origin: '',
    broker_id: user?.role === 'corretor' ? user.broker_id : '',
    status: 'Novo' as ClientStatus,
    notes: '',
    scheduling: 'Aguardando' // Valor padrão para novos clientes
  };

  const [client, setClient] = useState<Client>(initialClient);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noBrokers, setNoBrokers] = useState(false);

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
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
        
        // Filtra apenas os usuários que têm broker_id
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Dados do cliente antes da validação:', client);
      
      // Removemos os campos criado_at e updated_at para que o Supabase gere automaticamente
      const clientData = {
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
      };

      // Verifica se o broker_id é um UUID válido
      if (!clientData.broker_id) {
        throw new Error('Por favor, selecione um corretor');
      }

      if (!clientData.broker_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error('Por favor, selecione um corretor válido');
      }

      // Adiciona o broker_id só se for válido
      clientData.broker_id = client.broker_id;

      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          broker_id: client.broker_id,
          origin: client.origin || null,
          scheduling: 'Aguardando' // Garante que o agendamento seja definido como 'Aguardando'
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Código de erro do PostgreSQL para violação de unicidade
          // Verifica se o erro é sobre email ou CPF
          if (error.message.includes('clients_email_key')) {
            setError('Email já cadastrado. Por favor, use um email diferente.');
          } else if (error.message.includes('clients_cpf_key')) {
            setError('CPF já cadastrado. Por favor, use um CPF diferente.');
          } else {
            setError('Erro ao criar cliente. Por favor, tente novamente.');
          }
        } else {
          setError('Erro ao criar cliente. Por favor, tente novamente.');
        }
        return;
      }

      // Redireciona para a página de clientes após criar
      navigate('/admin/clients');
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      if (err instanceof Error) {
        setError(`Erro: ${err.message}`);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(`Erro: ${err.message}`);
      } else {
        setError('Erro ao criar cliente. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="default"
          onClick={() => navigate('/admin/clients')}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Voltar
        </Button>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Criar Novo Cliente</h1>
      </div>
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
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={client.cpf}
              onChange={(e) => setClient({ ...client, cpf: e.target.value })}
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
              required
            />
          </div>
          <div>
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              value={client.street}
              onChange={(e) => setClient({ ...client, street: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={client.number}
              onChange={(e) => setClient({ ...client, number: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={client.neighborhood}
              onChange={(e) => setClient({ ...client, neighborhood: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={client.city}
              onChange={(e) => setClient({ ...client, city: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={client.state}
              onChange={(e) => setClient({ ...client, state: e.target.value })}
              required
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
          <div>
            <Label htmlFor="origin">Origem</Label>
            <Input
              id="origin"
              value={client.origin}
              onChange={(e) => setClient({ ...client, origin: e.target.value })}
              placeholder="Ex: Site, Indicação, etc."
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            {loading ? 'Criando...' : 'Criar Cliente'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewClient;
