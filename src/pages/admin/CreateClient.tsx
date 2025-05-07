import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '../../types/client';
interface Broker {
  id: string;
  broker_id: string;
  name: string;
  role: string;
}

const CreateClient = () => {
  // Funções de validação
  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^([0-9])\1+$/.test(cpf)) return false;
    
    const digits = cpf.split('').map(Number);
    const sum1 = digits.slice(0, 9).reduce((sum, digit, index) => sum + digit * (10 - index), 0);
    const digit1 = (11 - (sum1 % 11)) % 10;
    
    const sum2 = digits.slice(0, 10).reduce((sum, digit, index) => sum + digit * (11 - index), 0);
    const digit2 = (11 - (sum2 % 11)) % 10;
    
    return digits[9] === digit1 && digits[10] === digit2;
  };

  const validateCEP = (cep: string) => {
    cep = cep.replace(/\D/g, '');
    return cep.length === 8;
  };

  const validatePhone = (phone: string) => {
    phone = phone.replace(/\D/g, '');
    return phone.length >= 10 && phone.length <= 11;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [complement, setComplement] = useState('');
  const [status, setStatus] = useState('Novo');
  const [broker, setBroker] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [brokerError, setBrokerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchCepData = async (cep: string) => {
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  const checkAdminAccess = async () => {
    try {
      const { user } = useAuth();
      if (!user) return false;

      // Verificar se o usuário tem acesso ao painel admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Erro ao verificar acesso:', userError);
        return false;
      }

      return userData?.role === 'admin';
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      return false;
    }
  };

  const loadBrokers = async () => {
    try {
      // Buscar corretores com role 'corretor'
      const { data: brokersData, error: brokersError } = await supabase
        .from('users')
        .select('id, broker_id, name, role')
        .eq('role', 'corretor')
        .order('name');

      // Verificar se temos dados
      if (brokersError) {
        console.error('Erro ao buscar corretores:', brokersError);
        setBrokerError('Erro ao buscar corretores');
        throw brokersError;
      }

      if (!brokersData || brokersData.length === 0) {
        console.log('Nenhum corretor encontrado com role corretor');
        setBrokers([]);
        setBrokerError('Nenhum corretor encontrado');
        return;
      }

      if (brokersError) {
        console.error('Erro ao buscar corretores:', brokersError);
        setBrokerError('Erro ao buscar corretores');
        throw brokersError;
      }

      // Verificar se temos dados
      if (!brokersData || brokersData.length === 0) {
        console.log('Nenhum corretor encontrado com broker_id');
        setBrokers([]);
        setBrokerError('Nenhum corretor encontrado');
        return;
      }

      // Verificar a estrutura dos dados
      console.log('Dados brutos dos corretores:', brokersData);
      
      // Converter os dados
      const formattedBrokers = brokersData.map(broker => ({
        id: broker.id, // ID sequencial
        broker_id: broker.broker_id, // UUID
        name: broker.name,
        role: broker.role
      }));

      console.log('Corretores formatados:', formattedBrokers);
      setBrokers(formattedBrokers);
    } catch (error) {
      console.error('Erro ao carregar corretores:', error);
      setBrokerError('Erro ao carregar corretores');
      throw error;
    }
  };

  useEffect(() => {
    loadBrokers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos obrigatórios
      if (!name.trim()) {
        throw new Error('O nome é obrigatório');
      }
      if (!cpf.trim()) {
        throw new Error('O CPF é obrigatório');
      }
      if (!email.trim()) {
        throw new Error('O email é obrigatório');
      }
      if (!broker) {
        throw new Error('O corretor é obrigatório');
      }

      // Validar CPF
      if (!validateCPF(cpf)) {
        throw new Error('CPF inválido');
      }

      // Validar email
      if (!validateEmail(email)) {
        throw new Error('Email inválido');
      }

      // Verificar se o CPF já existe
      const { data: existingClient, error: cpfError } = await supabase
        .from('clients')
        .select('id')
        .eq('cpf', cpf.trim().replace(/\D/g, ''))
        .single();

      if (existingClient) {
        throw new Error('Já existe um cliente com esse CPF');
      }

      if (cpfError && cpfError.code !== 'PGRST116') {
        throw new Error('Erro ao verificar CPF');
      }

      // Log para debug
      console.log('Corretor selecionado:', selectedBroker);
      console.log('broker_id:', broker);

      // Preparar dados para inserção
      const clientData = {
        name: name.trim(),
        cpf: cpf.trim() ? cpf.replace(/\D/g, '') : null,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        cep: cep.trim(),
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase() || 'SP', // Se não tiver estado, usa SP como padrão
        complement: complement.trim(),
        status,
        broker_id: broker, // Usando o UUID do corretor
        notes: notes.trim()
      };

      // Log para debug
      console.log('Dados do cliente para inserção:', clientData);

      // Inserir cliente
      const { error: insertError, data: insertData } = await supabase
        .from('clients')
        .insert([clientData])
        .select('*');

      if (insertError) {
        console.error('Erro de inserção:', insertError);
        throw new Error(`Erro ao salvar cliente: ${insertError.message}`);
      }

      console.log('Cliente inserido com sucesso:', insertData);

      // Redirecionar para a lista de clientes
      navigate('/admin/clients', {
        state: { success: 'Cliente criado com sucesso!' }
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Erro ao criar cliente. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Criar Novo Cliente</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="mt-1"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="exemplo@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => {
                    const newCep = e.target.value;
                    setCep(newCep);
                    if (newCep.length === 8) {
                      fetchCepData(newCep);
                    }
                  }}
                  className="mt-1"
                  placeholder="00000-000"
                />
                {loadingCep && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="broker">Corretor</Label>
              <Select
                value={broker || ''}
                onValueChange={(value) => {
                  if (value === 'none') return;
                  const selected = brokers.find(b => b.broker_id === value);
                  setSelectedBroker(selected);
                  setBroker(value);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o corretor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    Selecione um corretor...
                  </SelectItem>
                  {brokers && Array.isArray(brokers) && brokers.length > 0 ? (
                    brokers.map((broker) => (
                      <SelectItem key={broker.id} value={broker.broker_id}>
                        {broker.name} ({broker.role})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {brokerError || 'Nenhum corretor encontrado'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              placeholder="Digite suas observações aqui..."
            />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando...
              </>
            ) : (
              'Criar Cliente'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateClient;
