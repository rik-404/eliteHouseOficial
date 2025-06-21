import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, addDays, isToday, isTomorrow, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import UpcomingAppointments from '@/components/scheduling/UpcomingAppointments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

// Componente para o funil de vendas
const SalesFunnel = ({ data, onClick }: { data: any[], onClick: (status: string, count: number) => void }) => {
  // Status do Kanban e suas cores
  const statusColors = {
    'Novo': '#0096FF',
    'Atendimento': '#20B2AA',
    'Análise documental': '#8A2BE2',
    'Análise bancária': '#9370DB',
    'Aprovado': '#22C55E',
    'Condicionado': '#FF8C00',
    'Reprovado': '#E34234',
    'Venda realizada': '#1E90FF',
    'Distrato': '#555555'
  };

  // Total de movimentos
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Ordenar os status na ordem do funil
  const funnelOrder = [
    'Novo',
    'Atendimento',
    'Análise documental',
    'Análise bancária',
    'Condicionado',
    'Aprovado',
    'Reprovado',
    'Venda realizada',
    'Distrato'
  ];

  // Ordenar os dados de acordo com a ordem do funil
  const sortedData = [...data].sort((a, b) => {
    return funnelOrder.indexOf(a.status) - funnelOrder.indexOf(b.status);
  });

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm">
      <h3 className="text-base font-semibold mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
        </svg>
        Funil de vendas
      </h3>
      <div className="flex flex-col items-center space-y-0.5 max-w-sm mx-auto">
        {sortedData.map((item, index) => {
          // Calcular a largura do item com base na posição no funil
          // Primeiro item tem 95% de largura, último tem 60%
          const widthPercentage = 95 - (index * 3.5);
          const width = Math.max(60, widthPercentage);
          
          return (
            <div 
              key={item.status} 
              className="rounded-full py-0.5 px-2 text-center cursor-pointer hover:opacity-90 transition-opacity shadow-sm mb-0.5"
              style={{ 
                backgroundColor: statusColors[item.status as keyof typeof statusColors] || '#9e9e9e',
                width: `${width}%`,
                transform: 'translateX(0%)',
              }}
              onClick={() => onClick(item.status, item.count)}
            >
              <div className="font-medium text-white text-xs">{item.status}</div>
              <div className="text-base font-bold text-white">{item.count}</div>
            </div>
          );
        })}
        <div className="mt-1 text-center font-medium w-full">
          <div className="text-base font-bold">{total} movimentos de venda</div>
        </div>
      </div>
    </div>
  );
};

// Cores para os gráficos
const COLORS = {
  // Cores para o gráfico de origem dos clientes
  origin: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'],
  // Cores para o status de agendamento
  scheduling: {
    'Agendado': '#FFBB28',  // Amarelo
    'Nao_Realizado': '#FF0000',  // Vermelho
    'Não realizado': '#FF5733',  // Vermelho (mantendo compatibilidade)
    'Realizado': '#10B981'  // Verde
  },
  // Cores para o status de vendas
  sales: {
    'Venda realizada': '#10B981',  // Verde
    'Distrato': '#EF4444',         // Vermelho
    'Não informado': '#6B7280'     // Cinza
  }
};

// Função para renderizar os rótulos no gráfico
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  console.log('Renderizando rótulo:', { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name });
  
  // Verifica se os valores são válidos
  if (isNaN(cx) || isNaN(cy) || isNaN(midAngle) || isNaN(innerRadius) || isNaN(outerRadius) || isNaN(percent)) {
    console.error('Valores inválidos para renderizar o rótulo:', { cx, cy, midAngle, innerRadius, outerRadius, percent });
    return null;
  }
  
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
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  // Carrega o usuário do AuthContext quando o componente é montado
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);
  
  const handleSalesPieClick = (data: any, index: number) => {
    console.log('Dados do clique no gráfico de vendas:', data, 'Índice:', index);
    // Mapeia o nome do status para o formato usado no filtro
    const statusMap: Record<string, string> = {
      'Venda realizada': 'Venda realizada',
      'Distrato': 'Distrato',
      'Não informado': ''
    };
    
    const status = statusMap[data.name] || '';
    
    // Navega para a página de clientes com o filtro de status
    navigate(`/admin/clients?status=${encodeURIComponent(status)}`);
  };

  const handlePieClick = (data: any, index: number) => {
    console.log('Dados do clique:', data, 'Índice:', index);
    // Usa o nome da origem diretamente dos dados do clique
    const originName = data?.name || '';
    const origin = originName === 'Não informada' ? '' : originName;
    console.log('Navegando para origem:', origin);
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
      
      // Força o status para 'all' para mostrar todos os clientes com o filtro de agendamento
      parametros.set('status', 'all');
      
      console.log('Parâmetros da URL:', {
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
  const [originData, setOriginData] = useState<{name: string, value: number}[]>([]);
  const [schedulingData, setSchedulingData] = useState<{name: string, value: number}[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [overdueAppointments, setOverdueAppointments] = useState<any[]>([]);
  const [loadingOrigins, setLoadingOrigins] = useState(true);
  const [loadingScheduling, setLoadingScheduling] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Estado para armazenar os dados de vendas
  const [salesData, setSalesData] = useState<{name: string, value: number}[]>([]);
  
  // Estado para armazenar os dados do funil de vendas
  const [funnelData, setFunnelData] = useState<{status: string, count: number}[]>([]);
  const [loadingFunnel, setLoadingFunnel] = useState(true);
  const [isFunnelMinimized, setIsFunnelMinimized] = useState(true);
  
  // Estado para armazenar os dados de clientes em análise
  const [analysisData, setAnalysisData] = useState<{name: string, value: number}[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);

  // Função para lidar com o clique em um item do funil
  const handleFunnelClick = (status: string, count: number) => {
    console.log(`Clicou em ${status} com ${count} registros`);
    navigate(`/admin/clients?status=${encodeURIComponent(status)}`);
  };
  
  // Função para lidar com o clique em uma fatia do gráfico de análise
  const handleAnalysisClick = (data: any) => {
    if (data && data.name) {
      console.log(`Clicou em ${data.name} com ${data.value} registros`);
      navigate(`/admin/clients?status=${encodeURIComponent(data.name)}`);
    }
  };
  
  // Função para buscar os dados de clientes em análise
  const fetchAnalysisData = async () => {
    try {
      setLoadingAnalysis(true);
      
      // Status que queremos analisar
      const analysisStatus = ['Análise documental', 'Análise bancária'];
      
      // Cria a query base para buscar clientes
      let query = supabase
        .from('clients')
        .select('id, status, broker_id')
        .in('status', analysisStatus);
      
      // Se for um corretor, filtra apenas os clientes dele
      if (user?.role === 'corretor' && user?.broker_id) {
        query = query.eq('broker_id', user.broker_id);
      }
      
      const { data: clients, error } = await query;
      
      if (error) throw error;

      // Conta quantos clientes existem por status
      const statusCounts: Record<string, number> = {};
      
      // Inicializa todos os status com zero
      analysisStatus.forEach(status => {
        statusCounts[status] = 0;
      });
      
      // Conta os clientes por status
      clients?.forEach(client => {
        if (client?.status && analysisStatus.includes(client.status)) {
          statusCounts[client.status] = (statusCounts[client.status] || 0) + 1;
        }
      });

      // Formata os dados para o componente
      const formattedData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value
      }));

      console.log('Dados de clientes em análise:', formattedData);
      setAnalysisData(formattedData);
    } catch (error) {
      console.error('Erro ao buscar dados de clientes em análise:', error);
      setAnalysisData([]);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Função para buscar os dados do funil de vendas
  const fetchFunnelData = async () => {
    try {
      setLoadingFunnel(true);
      
      // Status do Kanban que queremos contar
      const kanbanStatus = [
        'Novo',
        'Atendimento',
        'Análise documental',
        'Análise bancária',
        'Aprovado',
        'Condicionado',
        'Reprovado',
        'Venda realizada',
        'Distrato'
      ];
      
      // Cria a query base para buscar clientes
      let query = supabase
        .from('clients')
        .select('id, status, broker_id');
      
      // Se for um corretor, filtra apenas os clientes dele
      if (user?.role === 'corretor' && user?.broker_id) {
        query = query.eq('broker_id', user.broker_id);
      }
      
      const { data: clients, error } = await query;
      
      if (error) throw error;

      // Conta quantos clientes existem por status do Kanban
      const statusCounts: Record<string, number> = {};
      
      // Inicializa todos os status com zero
      kanbanStatus.forEach(status => {
        statusCounts[status] = 0;
      });
      
      // Conta os clientes por status
      clients?.forEach(client => {
        const status = client?.status || 'Novo';
        if (kanbanStatus.includes(status)) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });

      // Formata os dados para o componente
      const formattedData = kanbanStatus.map(status => ({
        status,
        count: statusCounts[status] || 0
      }));

      console.log('Dados do funil de vendas:', formattedData);
      setFunnelData(formattedData);
    } catch (error) {
      console.error('Erro ao buscar dados do funil de vendas:', error);
      setFunnelData([]);
    } finally {
      setLoadingFunnel(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Total de imóveis
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Imóveis em destaque
      const { count: featuredProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);

      // Total de clientes
      const { count: totalClients, error: clientError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true });
      
      if (clientError) {
        console.error('Erro ao contar clientes:', clientError);
        throw clientError;
      }

      setStats({
        totalProperties: totalProperties || 0,
        featuredProperties: featuredProperties || 0,
        totalClients: totalClients || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Define valores padrão em caso de erro
      setStats({
        totalProperties: 0,
        featuredProperties: 0,
        totalClients: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedulingData = async () => {
    try {
      setLoadingScheduling(true);
      
      console.log('Buscando dados de agendamento...');
      
      // Cria a query base para buscar clientes com status de agendamento
      let query = supabase
        .from('clients')
        .select('id, scheduling, broker_id')
        .not('scheduling', 'is', null);
      
      // Se for um corretor, filtra apenas os clientes dele
      if (user?.role === 'corretor' && user?.broker_id) {
        console.log('Filtrando agendamentos para o corretor:', user.broker_id);
        query = query.eq('broker_id', user.broker_id);
      }
      
      const { data: clientsData, error: clientsError } = await query;
      
      if (clientsError) {
        console.error('Erro ao buscar clientes:', clientsError);
        setSchedulingData([{ name: 'Erro ao carregar', value: 1 }]);
        return;
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
      setSchedulingData([{ name: 'Erro ao carregar', value: 1 }]);
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
      
      // Cria a query base para agendamentos futuros
      let upcomingQuery = supabase
        .from('scheduling')
        .select('*')
        .gte('data', todayStr)
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      // Cria a query base para agendamentos atrasados
      let overdueQuery = supabase
        .from('scheduling')
        .select('*')
        .eq('status', 'Agendado')
        .lte('data', todayStr)
        .or(`and(data.eq.${todayStr},hora.lt.${currentTime}),data.lt.${todayStr}`)
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      // Se for um corretor, filtra apenas os agendamentos dele
      if (user?.role === 'corretor' && user?.broker_id) {
        console.log('Filtrando agendamentos para o corretor:', user.broker_id);
        upcomingQuery = upcomingQuery.eq('broker_id', user.broker_id);
        overdueQuery = overdueQuery.eq('broker_id', user.broker_id);
      }

      // Executa as queries
      const [{ data: upcomingData, error: upcomingError }, { data: overdueData, error: overdueError }] = await Promise.all([
        upcomingQuery,
        overdueQuery
      ]);

      if (upcomingError) throw upcomingError;
      if (overdueError) throw overdueError;
      
      console.log('Agendamentos futuros:', upcomingData);
      console.log('Agendamentos atrasados:', overdueData);
      
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
      
      // Cria a query base para buscar clientes e suas origens
      let query = supabase
        .from('clients')
        .select('origin, broker_id');
      
      // Se for um corretor, filtra apenas os clientes dele
      if (user?.role === 'corretor' && user?.broker_id) {
        console.log('Filtrando origens para o corretor:', user.broker_id);
        query = query.eq('broker_id', user.broker_id);
      }
      
      const { data: clients, error } = await query;
      
      console.log('Dados brutos do Supabase:', clients);
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }

      // Verifica se há clientes
      if (!clients || clients.length === 0) {
        console.log('Nenhum cliente encontrado');
        setOriginData([{ name: 'Nenhum dado disponível', value: 1 }]);
        return;
      }

      // Conta quantos clientes existem por origem
      const originCounts = clients.reduce((acc: Record<string, number>, client) => {
        const origin = client?.origin;
        const originName = origin || 'Não informada';
        acc[originName] = (acc[originName] || 0) + 1;
        return acc;
      }, {});

      console.log('Contagem de origens:', originCounts);

      // Formata os dados para o gráfico
      const formattedData = Object.entries(originCounts).map(([name, value]) => ({
        name,
        value,
      }));

      console.log('Dados formatados para o gráfico:', formattedData);
      
      // Verifica se os dados estão no formato correto
      const isValidData = formattedData.every(item => 
        item && typeof item.name === 'string' && typeof item.value === 'number'
      );
      
      if (!isValidData) {
        console.error('Formato de dados inválido:', formattedData);
        throw new Error('Formato de dados inválido para o gráfico');
      }

      setOriginData(formattedData);
    } catch (error) {
      console.error('Erro ao buscar origens dos clientes:', error);
      setOriginData([{ name: 'Erro ao carregar', value: 1 }]);
    } finally {
      console.log('Finalizando carregamento de origens');
      setLoadingOrigins(false);
    }
  };

  // Função para buscar os dados de vendas
  const fetchSalesData = async () => {
    try {
      setLoadingSales(true);
      
      // Cria a query base para buscar clientes
      let query = supabase
        .from('clients')
        .select('id, status, broker_id');
      
      // Se for um corretor, filtra apenas os clientes dele
      if (user?.role === 'corretor' && user?.broker_id) {
        console.log('Filtrando vendas para o corretor:', user.broker_id);
        query = query.eq('broker_id', user.broker_id);
      }
      
      const { data: clients, error } = await query;
      
      if (error) throw error;

      // Inicializa os contadores
      const statusCounts = {
        'Venda realizada': 0,
        'Distrato': 0,
        'Não informado': 0
      };

      // Conta quantos clientes existem por status
      clients?.forEach(client => {
        const status = client?.status?.trim() || '';
        
        if (status.toLowerCase() === 'venda realizada') {
          statusCounts['Venda realizada']++;
        } else if (status.toLowerCase() === 'distrato') {
          statusCounts['Distrato']++;
        } else {
          statusCounts['Não informado']++;
        }
      });

      // Formata os dados para o gráfico
      const formattedData = [
        { name: 'Venda realizada', value: statusCounts['Venda realizada'] },
        { name: 'Distrato', value: statusCounts['Distrato'] },
        { name: 'Não informado', value: statusCounts['Não informado'] }
      ];

      console.log('Dados de vendas processados:', formattedData);
      setSalesData(formattedData);
    } catch (error) {
      console.error('Erro ao buscar dados de vendas:', error);
      setSalesData([{ name: 'Erro ao carregar', value: 1 }]);
    } finally {
      setLoadingSales(false);
    }
  };

  // Carrega todos os dados quando o componente é montado
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchStats(),
          fetchOrigins(),
          fetchSchedulingData(),
          fetchSalesData(),
          fetchUpcomingAppointments(),
          fetchFunnelData(),
          fetchAnalysisData()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Recarrega os dados específicos do usuário quando ele for alterado
  useEffect(() => {
    if (user) {
      console.log('Usuário alterado, recarregando dados...');
      const loadUserData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            fetchSalesData(),
            fetchOrigins(),
            fetchSchedulingData(),
            fetchUpcomingAppointments(),
            fetchFunnelData()
          ]);
        } catch (error) {
          console.error('Erro ao recarregar dados do usuário:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadUserData();
    }
  }, [user?.id, user?.role]);

  // Verifica se o usuário está autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {loading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando informações do usuário...</p>
            </>
          ) : (
            <>
              <p className="text-red-500">Erro ao carregar informações do usuário</p>
              <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {user?.role === 'corretor' && (
            <p className="text-sm text-muted-foreground">
              Bem-vindo, {user.name || 'Corretor'}
            </p>
          )}
        </div>
        <Button
          variant={showCharts ? 'outline' : 'default'}
          onClick={() => setShowCharts(!showCharts)}
          className="gap-2"
        >
          <BarChart2 className="h-4 w-4" />
          {showCharts ? 'Ocultar gráficos' : 'Mostrar gráficos'}
        </Button>
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
              {user?.role === 'corretor' && (
                <span className="ml-2 text-xs text-muted-foreground">(Seus agendamentos)</span>
              )}
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
                
                // Se for corretor, filtra apenas os agendamentos dele
                if (user?.role === 'corretor' && user?.broker_id) {
                  return (
                    appt.broker_id === user.broker_id &&
                    apptDate >= today && 
                    apptDate <= nextWeek
                  );
                }
                
                return apptDate >= today && apptDate <= nextWeek;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueAppointments.filter(appt => {
                // Se for corretor, conta apenas os atrasados dele
                if (user?.role === 'corretor' && user?.broker_id) {
                  return appt.broker_id === user.broker_id;
                }
                return true;
              }).length > 0 ? (
                <span className="text-red-500">
                  {overdueAppointments.filter(appt => {
                    if (user?.role === 'corretor' && user?.broker_id) {
                      return appt.broker_id === user.broker_id;
                    }
                    return true;
                  }).length} atrasados
                </span>
              ) : 'Nenhum atraso'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funil de Vendas */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Funil de Vendas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFunnelMinimized(!isFunnelMinimized)}
            className="flex items-center gap-2"
          >
            {isFunnelMinimized ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            )}
            {isFunnelMinimized ? 'Expandir' : 'Minimizar'}
          </Button>
        </div>
        {loadingFunnel ? (
          <div className="flex items-center justify-center h-40 bg-white rounded-lg shadow-sm p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isFunnelMinimized ? (
          <div className="flex items-center justify-center h-16 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-muted-foreground">
              {funnelData.reduce((sum, item) => sum + item.count, 0)} movimentos de venda
            </div>
          </div>
        ) : (
          <SalesFunnel data={funnelData} onClick={handleFunnelClick} />
        )}
      </div>

      {/* Seção de Gráficos */}
      {showCharts && (
        <div className="grid gap-4 mt-6">
          {/* Gráfico de Vendas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                <CardTitle>
                  Status de Vendas
                  {user?.role === 'corretor' && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Seus clientes)
                    </span>
                  )}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Distribuição dos status de vendas dos clientes
              </p>
            </CardHeader>
            <CardContent className="h-64">
              {loadingSales ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : salesData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      style={{ cursor: 'pointer' }}
                      onClick={handleSalesPieClick}
                    >
                      {salesData.map((entry, index) => {
                        // Define a cor com base no status
                        let color = '#6B7280'; // Cor padrão
                        if (entry.name === 'Venda realizada') color = '#10B981';
                        if (entry.name === 'Distrato') color = '#EF4444';
                        
                        return (
                          <Cell 
                            key={`sales-cell-${index}`} 
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
          
          {/* Gráfico de Clientes em Análise */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                <CardTitle>
                  Clientes em Análise
                  {user?.role === 'corretor' && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Seus clientes)
                    </span>
                  )}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Clientes em análise documental e bancária
              </p>
            </CardHeader>
            <CardContent className="h-64">
              {loadingAnalysis ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : analysisData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Nenhum cliente em análise</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analysisData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Quantidade" 
                      fill="#8884d8" 
                      onClick={handleAnalysisClick}
                      cursor="pointer"
                    >
                      {analysisData.map((entry, index) => {
                        // Define a cor com base no status
                        let color = '#8884d8'; // Cor padrão para Análise documental
                        if (entry.name === 'Análise bancária') color = '#82ca9d';
                        
                        return (
                          <Cell 
                            key={`analysis-cell-${index}`} 
                            fill={color}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Origem dos Clientes */}
            <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                <CardTitle>
                  Origem dos Clientes
                  {user?.role === 'corretor' && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Seus clientes)
                    </span>
                  )}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Clique em uma origem para ver os clientes
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
                <div className="h-full w-full">
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
                        nameKey="name"
                        onClick={(data, index, event) => {
                          console.log('=== DETALHES DO CLIQUE ===');
                          console.log('Dados do clique:', data);
                          console.log('Índice do clique:', index);
                          console.log('Dados completos do gráfico:', originData);
                          handlePieClick(data, index);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {originData.map((entry, index) => {
                          console.log('Renderizando célula:', { entry, index });
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS.origin[index % COLORS.origin.length]} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => {
                          console.log('Tooltip:', { value, name, props });
                          return [`${name}: ${value}`, 'Clientes'];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
                  {user?.role === 'corretor' && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Seus clientes)
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
                        // Cores para cada status de agendamento
                        let color = '#6B7280'; // Cor padrão
                        if (entry.name in COLORS.scheduling) {
                          color = COLORS.scheduling[entry.name as keyof typeof COLORS.scheduling];
                        }
                        
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
