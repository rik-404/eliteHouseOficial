import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '../../types/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewClient = () => {
  const [client, setClient] = useState<Client>({
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
    broker_id: '',
    status: 'Novo' as 'Novo' | 'Atendimento' | 'Análise documental' | 'Análise bancária' | 'Aprovado' | 'Condicionado' | 'Reprovado' | 'Venda realizada' | 'Distrato',
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'broker');

        if (error) throw error;
        setBrokers(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBrokers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (error) throw error;

      window.close(); // Fecha a aba atual após criar o cliente
    } catch (err) {
      setError('Erro ao criar cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={client.cpf}
                  onChange={(e) => setClient({ ...client, cpf: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="broker_id">Corretor</Label>
                <Select
                  value={client.broker_id}
                  onValueChange={(value) => setClient({ ...client, broker_id: value })}
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={client.cep}
                  onChange={(e) => setClient({ ...client, cep: e.target.value })}
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
                type="button"
                variant="outline"
                onClick={() => window.close()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {loading ? 'Criando...' : 'Criar'}
              </Button>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewClient;
