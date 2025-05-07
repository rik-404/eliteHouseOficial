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
  username: string;
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

  const { user } = useAuth();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [complement, setComplement] = useState('');
  const [status, setStatus] = useState('Novo');
  const [notes, setNotes] = useState('');
  const [broker, setBroker] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'corretor') {
      setBroker(user.username);
      setSelectedBroker({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } else {
      loadBrokers();
    }
  }, [user]);

  const loadBrokers = async () => {
    try {
      const { data: brokersData, error } = await supabase
        .from('profiles')
        .select('id, username, name, role')
        .eq('role', 'corretor');

      if (error) throw error;
      if (!brokersData) return;

      setBrokers(brokersData);
      if (brokersData.length > 0) {
        setBroker(brokersData[0].username);
        setSelectedBroker(brokersData[0]);
      }
    } catch (error) {
      console.error('Error loading brokers:', error);
      setError('Erro ao carregar corretores');
    }
  };

  useEffect(() => {
    loadBrokers();
  }, []);

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
        state: state.trim().toUpperCase() || 'SP',
        complement: complement.trim(),
        status,
        broker_id: user.username, // Usando o username como broker_id
        notes: notes.trim()
      };

      // Inserir cliente
      const { error: insertError } = await supabase
        .from('clients')
        .insert([clientData]);

      if (insertError) {
        throw new Error(`Erro ao salvar cliente: ${insertError.message}`);
      }

      // Redirecionar para a lista de clientes
      navigate('/admin/clients', {
        state: { success: 'Cliente criado com sucesso!' }
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao criar cliente. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Criar Novo Cliente</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {user?.role !== 'corretor' ? (
            <div>
              <Label htmlFor="broker_id">Corretor</Label>
              <Select
                value={broker}
                onValueChange={(value) => {
                  setBroker(value);
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um corretor" />
                </SelectTrigger>
                <SelectContent>
                  {brokers.map((broker) => (
                    <SelectItem key={broker.id} value={broker.username}>
                      {broker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="broker_id">Corretor: {user?.name}</Label>
              <div className="text-gray-500">
                Corretor atual: {user?.username}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => {
                const cpf = e.target.value.replace(/\D/g, '');
                setCpf(cpf);
              }}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => {
                const phone = e.target.value.replace(/\D/g, '');
                setPhone(phone);
              }}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="cep">CEP</Label>
            <div className="relative">
              <Input
                id="cep"
                value={cep}
                onChange={(e) => {
                  const cep = e.target.value.replace(/\D/g, '');
                  setCep(cep);
                }}
                required
              />
              <Button
                type="button"
                onClick={() => fetchCepData(cep)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loadingCep}
              >
                {loadingCep ? 'Carregando...' : 'Buscar'}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Cliente'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateClient;
