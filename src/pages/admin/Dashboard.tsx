import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    featuredProperties: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);

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
      const { count: totalClients } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

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

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Imóveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="animate-spin h-8 w-8" /> : stats.totalProperties}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="animate-spin h-8 w-8" /> : stats.featuredProperties}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="animate-spin h-8 w-8" /> : stats.totalClients}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
