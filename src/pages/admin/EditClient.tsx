import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  status: string;
  broker_id: string;
  notes: string;
}

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { data: clientData, error: fetchError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setClient(clientData);
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        setError('Erro ao carregar dados do cliente');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => navigate('/admin/clients')} className="mt-4">
            Voltar para lista de clientes
          </Button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cliente não encontrado</p>
          <Button onClick={() => navigate('/admin/clients')} className="mt-4">
            Voltar para lista de clientes
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: updateError } = await supabase
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
          status: client.status,
          broker_id: client.broker_id,
          notes: client.notes
        })
        .eq('id', client.id);

      if (updateError) throw updateError;

      navigate('/admin/clients');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      setError('Erro ao atualizar cliente');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Editar Cliente</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos do formulário aqui */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={client.cpf}
              onChange={(e) => setClient({ ...client, cpf: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={client.phone}
              onChange={(e) => setClient({ ...client, phone: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Outros campos do formulário */}

          <Button type="submit" className="mt-4">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditClient;
