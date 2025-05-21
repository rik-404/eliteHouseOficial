import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLogs } from '@/contexts/LogsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ActivityLog = () => {
  const { logs, fetchLogs, loading, error } = useLogs();
  const [filter, setFilter] = useState({
    userId: '',
    entityType: '',
  });

  const handleFilter = () => {
    fetchLogs({
      userId: filter.userId,
      entityType: filter.entityType,
    });
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Histórico de Atividades</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Filtrar por usuário..."
              value={filter.userId}
              onChange={(e) => setFilter(prev => ({ ...prev, userId: e.target.value }))}
              className="max-w-[200px]"
            />
            <Input
              placeholder="Filtrar por tipo..."
              value={filter.entityType}
              onChange={(e) => setFilter(prev => ({ ...prev, entityType: e.target.value }))}
              className="max-w-[200px]"
            />
            <Button onClick={handleFilter}>
              Filtrar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            {error}
          </div>
        ) : (
          <div className="h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{log.user_name}</TableCell>
                    <TableCell className={`capitalize ${
                      log.action === 'create' ? 'text-green-600' :
                      log.action === 'update' ? 'text-blue-600' :
                      'text-red-600'
                    }`}>
                      {log.action}
                    </TableCell>
                    <TableCell>
                      {log.entity_type} - {log.entity_name}
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.ip_address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};