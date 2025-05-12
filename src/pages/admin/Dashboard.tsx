import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, BarChart2, ChevronDown, Filter, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, addDays, isToday, isTomorrow, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { UpcomingAppointments } from '@/components/scheduling/UpcomingAppointments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Cores para os gráficos
const COLORS = {
  // Cores para o gráfico de origem dos clientes
  origin: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  // Cores para o status de agendamento
  status: {
    'Agendado': '#FFBB28',  // Amarelo
    'Nao_Realizado': '#FF0000',  // Vermelho
    'Não realizado': '#FF5733',  // Vermelho (mantendo compatibilidade)
    'Realizado': '#2ECC71'  // Verde
  }
};

// Função para renderizar os rótulos no gráfico
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  const handlePieClick = (data: any, index: number) => {
    const origin = originData[index]?.name === 'Não informada' ? '' : originData[index]?.name;
    navigate(`/admin/clients?origin=${encodeURIComponent(origin || '')}`);
  };

  // Função para mapear o status do gráfico para o valor do banco de dados
  const mapStatusToDbValue = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Agendado': 'Aguardando',
      'Não realizado': 'Nao_Realizado',
      'Realizado': 'Realizado',
      'Aguardando': 'Aguardando',  // Adicionado para garantir compatibilidade
      'Nao_Realizado': 'Nao_Realizado'  // Adicionado para garantir compatibilidade
    };
    return statusMap[status] || status;
  };

  const handleSchedulingClick = (data: any, event: React.MouseEvent) => {
    console.log('=== CLIQUE NO GRÁFICO DE AGENDAMENTO ===');
    console.log('Dados do clique:', data);
    console.log('Evento de clique:', event);
    
    try {
      // Obtém o status clicado diretamente do data.name
      const statusClicado = data?.name;
      console.log('Status clicado:', statusClicado);
      
      // Se não tiver status ou for um status inválido, não faz nada
      if (!statusClicado || ['Sem dados', 'Erro ao carregar'].includes(statusClicado)) {
        console.log('Status inválido para navegação:', statusClicado);
        return;
      }
      
      // Mapeia o status para o formato do banco de dados
      const statusNoBanco = mapStatusToDbValue(statusClicado);
      console.log('Status mapeado para o banco de dados:', statusNoBanco);
      
      // Cria os parâmetros de busca
      const parametros = new URLSearchParams();
      
      // Adiciona o status de agendamento se existir
      if (statusNoBanco) {
        parametros.set('scheduling', statusNoBanco);
        console.log('Filtro de agendamento aplicado:', statusNoBanco);
      }
      
      // Adiciona o parâmetro de corretor
      // Se não tiver corretor selecionado ou for 'all', usa 'all'
      const brokerValue = !selectedBroker || selectedBroker === 'all' ? 'all' : selectedBroker;
      parametros.set('broker', brokerValue);
      
      // Força o status para 'all' para mostrar todos os clientes com o filtro de agendamento
      parametros.set('status', 'all');
      
      console.log('Parâmetros da URL:', {
        broker: brokerValue,
        scheduling: statusNoBanco,
        status: 'all'
      });
      
      // Constrói a URL
      const parametrosString = parametros.toString();
      const url = `/admin/clients${parametrosString ? `?${parametrosString}` : ''}`;
      
      console.log('Navegando para:', url);
      console.log('Parâmetros de busca:', parametrosString);
      
      // Navega para a URL
      navigate(url, { 
        replace: true,
        state: { fromDashboard: true }
      });
      
      console.log('=== FIM handleSchedulingClick ===');
    } catch (error) {
      console.error('Erro ao processar clique no gráfico de agendamento:', error);
    }
  };

  const [stats, setStats] = useState({
    totalProperties: 0,
    featuredProperties: 0,
    totalClients: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [brokers, setBrokers] = useState<{id: string, name: string | null, username: string}[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<string>('all');
  const [originData, setOriginData] = useState<{name: string, value: number}[]>([]);
  const [schedulingData, setSchedulingData] = useState<{name: string, value: number}[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [overdueAppointments, setOverdueAppointments] = useState<any[]>([]);
  const [loadingOrigins, setLoadingOrigins] = useState(true);
  const [loadingScheduling, setLoadingScheduling] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Total de imóveis (não afetado pelo filtro de corretor)
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Imóveis em destaque (não afetado pelo filtro de corretor)
      const { count: featuredProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);

      // Total de clientes (afetado pelo filtro de corretor)
      let clientQuery = supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Aplica o filtro de corretor se não for 'all'
      if (selectedBroker !== 'all') {
        clientQuery = clientQuery.eq('broker_id', selectedBroker);
      }

      
      const { count: totalClients } = await clientQuery;

      setStats({
        totalProperties: totalProperties || 0,
        featuredProperties: featuredProperties || 0,
        totalClients: totalClients || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedulingData = async () => {
    try {
      setLoadingScheduling(true);
      
      console.log('Buscando dados de agendamento...');
      
      // Busca os clientes com status de agendamento
      let clientsQuery = supabase
        .from('clients')
        .select('scheduling, broker_id')
        .not('scheduling', 'is', null);

      // Aplica o filtro de corretor se não for 'all'
      if (selectedBroker && selectedBroker !== 'all') {
        console.log('Aplicando filtro de corretor:', selectedBroker);
        clientsQuery = clientsQuery.eq('broker_id', selectedBroker);
      }

      const { data: clientsData, error: clientsError } = await clientsQuery;
      
      if (clientsError) {
        console.error('Erro ao buscar clientes:', clientsError);
        throw clientsError;
      }

      console.log('Dados brutos de agendamento:', clientsData);

      // Se não houver dados, limpa o gráfico
      if (!clientsData || clientsData.length === 0) {
        console.log('Nenhum dado de agendamento encontrado');
        setSchedulingData([
          { name: 'Sem dados', value: 1 }
        ]);
        return;
      }

      // Mapeia os valores antigos para os novos valores
      const statusMap: Record<string, string> = {
        'Aguardando': 'Agendado',
        'Nao_Realizado': 'Não realizado',
        'Realizado': 'Realizado'
      };

      // Conta a ocorrência de cada status de agendamento
      const statusCounts = clientsData.reduce((acc: Record<string, number>, { scheduling }) => {
        if (!scheduling) return acc;
        
        // Mapeia o status para o valor correto
        const mappedStatus = statusMap[scheduling] || scheduling;
        
        // Se for 'Agendado', conta como 'Agendado' no gráfico
        if (scheduling === 'Aguardando') {
          acc['Agendado'] = (acc['Agendado'] || 0) + 1;
        } else {
          // Para outros status, mantém o valor original
          acc[mappedStatus] = (acc[mappedStatus] || 0) + 1;
        }
        
        return acc;
      }, {});

      console.log('Contagem de status:', statusCounts);

      // Formata os dados para o gráfico
      const formattedData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      }));

      console.log('Dados formatados para o gráfico:', formattedData);

      // Se não houver dados, exibe uma mensagem
      if (formattedData.length === 0) {
        console.log('Nenhum dado formatado para exibição');
        setSchedulingData([
          { name: 'Sem dados', value: 1 }
        ]);
      } else {
        console.log(`Exibindo ${formattedData.length} itens no gráfico`);
        setSchedulingData(formattedData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de agendamento:', error);
      setSchedulingData([
        { name: 'Erro ao carregar', value: 1 }
      ]);
    } finally {
      setLoadingScheduling(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      setLoadingAppointments(true);
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
      
      // Busca agendamentos futuros
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('scheduling')
        .select('*')
        .gte('data', todayStr)
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      if (upcomingError) throw upcomingError;
      
      // Busca agendamentos atrasados
      const { data: overdueData, error: overdueError } = await supabase
        .from('scheduling')
        .select('*')
        .eq('status', 'Agendado')
        .lte('data', todayStr)
        .or(`and(data.eq.${todayStr},hora.lt.${currentTime}),data.lt.${todayStr}`)
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      if (overdueError) throw overdueError;
      
      setUpcomingAppointments(upcomingData || []);
      setOverdueAppointments(overdueData || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchOrigins = async () => {
    try {
      setLoadingOrigins(true);
      let query = supabase
        .from('clients')
        .select('origin, broker_id')
        .not('origin', 'is', null);

      // Aplica o filtro de corretor se não for 'all'
      if (selectedBroker !== 'all') {
        query = query.eq('broker_id', selectedBroker);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Conta a ocorrência de cada origem
      const originCounts = data.reduce((acc: Record<string, number>, { origin }) => {
        const originName = origin || 'Não informada';
        acc[originName] = (acc[originName] || 0) + 1;
        return acc;
      }, {});

      // Formata os dados para o gráfico
      const formattedData = Object.entries(originCounts).map(([name, value]) => ({
        name,
        value,
      }));

      setOriginData(formattedData);
    } catch (error) {
      console.error('Erro ao buscar origens dos clientes:', error);
    } finally {
      setLoadingOrigins(false);
    }
  };

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoadingBrokers(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, name, username, broker_id')
          .eq('role', 'corretor');

        if (error) throw error;
        setBrokers(data || []);
      } catch (error) {
        console.error('Erro ao buscar corretores:', error);
      } finally {
        setLoadingBrokers(false);
      }
    };
    
    fetchBrokers();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchStats();
        await fetchOrigins();
        await fetchSchedulingData();
        await fetchUpcomingAppointments();
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Recarrega os dados quando o corretor selecionado mudar
    loadData();
  }, [selectedBroker]);

  // Função para obter o nome do corretor selecionado
  const getSelectedBrokerName = () => {
    if (selectedBroker === 'all') return null;
    const broker = brokers.find(b => b.id === selectedBroker);
    return broker ? (broker.name || broker.username) : null;
  };

  const selectedBrokerName = getSelectedBrokerName();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {selectedBrokerName && (
            <p className="text-sm text-muted-foreground">
              Filtrando por corretor: <span className="font-medium text-foreground">{selectedBrokerName}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={loadingBrokers}>
                <Filter className="h-4 w-4" />
                {loadingBrokers ? 'Carregando...' : 'Filtrar por corretor'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setSelectedBroker('all')}>
                Todos os corretores
              </DropdownMenuItem>
              {brokers.map((broker) => (
                <DropdownMenuItem
                  key={broker.id}
                  onSelect={() => setSelectedBroker(broker.id)}
                >
                  {broker.name || broker.username}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant={showCharts ? 'outline' : 'default'}
            onClick={() => setShowCharts(!showCharts)}
            className="gap-2"
          >
            <BarChart2 className="h-4 w-4" />
            {showCharts ? 'Ocultar gráficos' : 'Mostrar gráficos'}
          </Button>
        </div>
      </div>

      {/* Cartões de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/admin/properties">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Imóveis
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                {stats.featuredProperties} em destaque
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/clients">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Clientes
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos 7 Dias
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingAppointments.filter(appt => {
                const apptDate = new Date(appt.data);
                const today = new Date();
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                return apptDate >= today && apptDate <= nextWeek;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueAppointments.length > 0 ? (
                <span className="text-red-500">{overdueAppointments.length} atrasados</span>
              ) : 'Nenhum atraso'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos */}
      {showCharts && (
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {/* Gráfico de Origem dos Clientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                <CardTitle>
                  Origem dos Clientes
                  {selectedBrokerName && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (Filtrado por: {selectedBrokerName})
                    </span>
                  )}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Clique em uma origem para filtrar os clientes
              </p>
            </CardHeader>
            <CardContent className="h-64">
              {loadingOrigins ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : originData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={originData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={handlePieClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {originData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.origin[index % COLORS.origin.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Status de Agendamento */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                <CardTitle>
                  Status de Agendamento
                  {selectedBrokerName && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (Filtrado por: {selectedBrokerName})
                    </span>
                  )}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Distribuição dos status de agendamento dos clientes
              </p>
            </CardHeader>
            <CardContent className="h-64">
              {loadingScheduling ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : schedulingData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={schedulingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data, index, event) => {
                        console.log('=== EVENTO DE CLIQUE DETECTADO ===');
                        console.log('Dados do clique:', data);
                        console.log('Índice:', index);
                        console.log('Evento:', event);
                        handleSchedulingClick(data, event);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {schedulingData.map((entry, index) => {
                        // Cores para cada status conforme solicitado
                        let color = COLORS.status[entry.name as keyof typeof COLORS.status] || '#6B7280';
                        
                        return (
                          <Cell
                            key={`scheduling-cell-${index}`}
                            fill={color}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seção de Agendamentos */}
      <div className="mt-6">
        <UpcomingAppointments />
      </div>
    </div>
  );
};

export default Dashboard;
