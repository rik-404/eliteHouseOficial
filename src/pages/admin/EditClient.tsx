import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, CalendarPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/TempAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CustomForm from '@/components/ui/CustomForm';
import { ScheduleAppointmentDialog } from '@/components/scheduling/ScheduleAppointmentDialog';
import ClientDocuments from '@/components/client/ClientDocuments';
import ClientAppointmentHistory from '@/components/client/ClientAppointmentHistory';

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

type ClientStatus = Client['status'];

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
  const [isEditSectionMinimized, setIsEditSectionMinimized] = useState(true);
  const [isDocumentsSectionMinimized, setIsDocumentsSectionMinimized] = useState(true);
  const [isAppointmentsSectionMinimized, setIsAppointmentsSectionMinimized] = useState(true);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        console.error('CEP não encontrado');
        return;
      }

      setClient(prev => ({
        ...prev!,
        cep: data.cep,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }));
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

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

  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    return cpf.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Função para formatar PIS
  const formatPIS = (pis: string) => {
    return pis.replace(/\D/g, '')
      .replace(/^(\d{3})(\d{5})(\d{2})(\d{1})$/, '$1.$2.$3-$4');
  };

  // Função para formatar RG
  const formatRG = (rg: string) => {
    // Remove tudo que não for dígito
    const value = rg.replace(/\D/g, '');
    
    // Verifica se tem o dígito verificador (último dígito pode ser X)
    if (value.length <= 2) return value;
    
    // Formatação: XX.XXX.XXX-X
    return value
      .replace(/^(\d{2})(\d{3})(\d{3})([0-9Xx])$/, '$1.$2.$3-$4')
      .toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!client) {
      setError('Cliente não encontrado');
      setLoading(false);
      return;
    }

    try {
      // Formatar CPF, RG e PIS antes de enviar, garantindo que sejam strings
      const formattedClient = {
        ...client,
        cpf: client.cpf && typeof client.cpf === 'string' ? formatCPF(client.cpf) : client.cpf || null,
        rg: client.rg && typeof client.rg === 'string' ? formatRG(client.rg) : client.rg || null,
        pis: client.pis && typeof client.pis === 'string' ? formatPIS(client.pis) : client.pis || null,
        // Garante que birth_date seja uma string de data válida ou null
        birth_date: client.birth_date ? new Date(client.birth_date).toISOString() : null,
        updated_at: new Date().toISOString()
      };
      
      // Atualiza o estado local com os dados formatados
      setClient(formattedClient);

      // Validar campos obrigatórios
      if (!formattedClient.name) throw new Error('Nome é obrigatório');
      if (!formattedClient.phone) throw new Error('Telefone é obrigatório');
      if (!formattedClient.broker_id) throw new Error('Corretor é obrigatório');
      if (!formattedClient.status) throw new Error('Status é obrigatório');

      // Verificar permissões antes de salvar
      if (user?.role === 'corretor' && (formattedClient.status === 'Análise bancária' || formattedClient.status === 'Aprovado' || formattedClient.status === 'Condicionado' || formattedClient.status === 'Reprovado')) {
        setError('Você não tem permissão para editar este cliente nesse status');
        setLoading(false);
        return;
      }

      console.log('Dados a serem enviados:', formattedClient);

      const { data, error } = await supabase
        .from('clients')
        .update({
          name: formattedClient.name,
          cpf: formattedClient.cpf,
          rg: formattedClient.rg,
          pis: formattedClient.pis,
          birth_date: formattedClient.birth_date,
          email: formattedClient.email,
          phone: formattedClient.phone,
          cep: formattedClient.cep || null,
          street: formattedClient.street || null,
          number: formattedClient.number || null,
          neighborhood: formattedClient.neighborhood || null,
          city: formattedClient.city || null,
          state: formattedClient.state || null,
          complement: formattedClient.complement || null,
          broker_id: formattedClient.broker_id,
          status: formattedClient.status,
          notes: formattedClient.notes,
          origin: formattedClient.origin || null,
          scheduling: formattedClient.scheduling || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', formattedClient.id)
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Resposta do servidor:', data);
      
      // Atualiza os dados do cliente localmente com a resposta do servidor
      setClient(data);
      
      // Exibe mensagem de sucesso
      alert('Cliente atualizado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setError(`Erro ao atualizar cliente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
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
      <div className="flex justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/clients')}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Voltar
        </Button>
      </div>
      
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

      <Card className="relative">
        <CardHeader className={isEditSectionMinimized ? 'pb-2' : ''}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <CardTitle className={isEditSectionMinimized ? 'opacity-50' : ''}>
                Editar Cliente
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditSectionMinimized(!isEditSectionMinimized)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {isEditSectionMinimized ? (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Mostrar
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Esconder
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className={isEditSectionMinimized ? 'hidden' : ''}>
          <CustomForm onSubmit={handleSubmit} className="space-y-6">
            {/* Linha 1: Dados Pessoais e Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna 1: Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dados Pessoais</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={client.name}
                      onChange={(e) => setClient({ ...client, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={client.cpf || ''}
                        onChange={(e) => setClient({ ...client, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={client.rg || ''}
                        onChange={(e) => setClient({ ...client, rg: e.target.value })}
                        placeholder="00.000.000-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birth_date">Data Nasc.</Label>
                      <Input
                        type="date"
                        id="birth_date"
                        value={client.birth_date ? new Date(client.birth_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          // Converte a data para o formato ISO antes de salvar
                          const dateValue = e.target.value ? new Date(e.target.value).toISOString() : null;
                          setClient({ ...client, birth_date: dateValue });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pis">PIS</Label>
                      <Input
                        id="pis"
                        value={client.pis || ''}
                        onChange={(e) => setClient({ ...client, pis: e.target.value })}
                        placeholder="000.00000.00-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Contato */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contato</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={client.email || ''}
                      onChange={(e) => setClient({ ...client, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      value={client.phone}
                      onChange={(e) => setClient({ ...client, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={client.cep || ''}
                    onChange={(e) => setClient({ ...client, cep: e.target.value })}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={client.street || ''}
                    onChange={(e) => setClient({ ...client, street: e.target.value })}
                    placeholder="Nome da rua"
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={client.number || ''}
                    onChange={(e) => setClient({ ...client, number: e.target.value })}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={client.complement || ''}
                    onChange={(e) => setClient({ ...client, complement: e.target.value })}
                    placeholder="Apto, bloco, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={client.neighborhood || ''}
                    onChange={(e) => setClient({ ...client, neighborhood: e.target.value })}
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={client.city || ''}
                    onChange={(e) => setClient({ ...client, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    value={client.state || ''}
                    onChange={(e) => setClient({ ...client, state: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {/* Seção de Status e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Status</h3>
                <div className="space-y-4">
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
                {/* Botão "Agendar Visita" movido para a seção de histórico de agendamentos */}
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
          </CustomForm>
        </CardContent>
      </Card>

      {/* Seção de Documentos */}
      {client && (
        <Card className="mt-6 relative">
          {/* Removida a mensagem de seção minimizada */}
          <CardHeader className={isDocumentsSectionMinimized ? 'pb-2' : ''}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <CardTitle className={isDocumentsSectionMinimized ? 'opacity-50' : ''}>
                  Documentos do Cliente
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDocumentsSectionMinimized(!isDocumentsSectionMinimized)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {isDocumentsSectionMinimized ? (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Mostrar
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Esconder
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={isDocumentsSectionMinimized ? 'hidden' : ''}>
            <ClientDocuments clientId={client.id} />
          </CardContent>
        </Card>
      )}
      
      {/* Seção de Histórico de Agendamentos */}
      {client && (
        <Card className="mt-6 relative">
          <CardHeader className={isAppointmentsSectionMinimized ? 'pb-2' : ''}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <CardTitle className={isAppointmentsSectionMinimized ? 'opacity-50' : ''}>
                  Histórico de Agendamentos
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAppointmentsSectionMinimized(!isAppointmentsSectionMinimized)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {isAppointmentsSectionMinimized ? (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Mostrar
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Esconder
                    </>
                  )}
                </Button>
              </div>
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
            </div>
          </CardHeader>
          <CardContent className={isAppointmentsSectionMinimized ? 'hidden' : ''}>
            <ClientAppointmentHistory clientId={client.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EditClient;
