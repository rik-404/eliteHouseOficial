          import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Pencil, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/TempAuthContext';
import { User } from '../../types/user';
// Removida importação do modal de confirmação com senha

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>('all');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [noPermission, setNoPermission] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // Estados relacionados à confirmação com senha foram removidos
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
    
    // Configurar escuta em tempo real para a tabela de usuários
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('Mudança detectada na tabela users:', payload);
          fetchUsers(); // Atualiza a lista de usuários automaticamente
        }
      )
      .subscribe();

    // Limpar a escuta quando o componente for desmontado
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      // Mostrar confirmação para ativar ou desativar
      const message = active 
        ? 'Tem certeza que deseja ativar este usuário?'
        : 'Tem certeza que deseja desativar este usuário?';
      
      const confirmed = window.confirm(message);
      if (!confirmed) return;

      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ active })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, active } : user
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      // Agora apenas define o ID do usuário para confirmação visual
      setConfirmDelete(userId);
    } catch (error) {
      console.error('Erro ao iniciar processo de exclusão:', error);
    }
  };

  const confirmDeleteUser = async () => {
    try {
      if (!confirmDelete) return;
      
      // Processo simplificado sem necessidade de targetUserId
      setLoading(true);
      // Verifica se o usuário está tentando excluir a si mesmo
      if (currentUser?.id === confirmDelete) {
        throw new Error('Não é possível excluir a própria conta');
      }

      // Verificar se o usuário atual é um desenvolvedor ou se está tentando excluir um corretor
      if (currentUser?.role === 'dev' || (currentUser?.role === 'admin' && users.find(u => u.id === confirmDelete)?.role === 'corretor')) {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', confirmDelete);
          
        if (error) throw error;
      } else {
        throw new Error('Você não tem permissão para excluir este usuário');
      }

      setUsers(prev => prev.filter(user => user.id !== confirmDelete));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  const filteredUsers = users.filter(user =>
    // Administradores e desenvolvedores podem ver todos
    (currentUser?.role === 'admin' || currentUser?.role === 'dev') ||
    // Outros cargos não devem ver nada
    (currentUser?.role !== 'admin' && currentUser?.role !== 'dev') &&
    (!roleFilter || roleFilter === 'all' || user.role === roleFilter) &&
    (search ?
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.toLowerCase().includes(search.toLowerCase()) ||
      user.cpf?.toLowerCase().includes(search.toLowerCase())
    : true)
  );

  // Cálculo da paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Componente de paginação reutilizável
  const PaginationControls = ({ position = 'bottom' }) => (
    <div className={`flex items-center justify-between ${position === 'top' ? 'mb-4' : 'mt-4'}`}>
      <div className="text-sm text-gray-500">
        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuários
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Mostra no máximo 5 páginas de cada vez
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? "bg-blue-500 text-white" : ""}
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-2">...</span>
          )}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              className={currentPage === totalPages ? "bg-blue-500 text-white" : ""}
            >
              {totalPages}
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  );

  // Efeito para voltar para a primeira página quando os filtros mudarem
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  return (
    <div className="container mx-auto p-4 space-y-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-white">Usuários</h1>
        <Button 
          onClick={() => navigate('/admin/users/create')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          + Novo Usuário
        </Button>
        {/* Modal de confirmação com senha removido */}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="w-48">
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Filtrar por Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Usuários</SelectItem>
              <SelectItem value="corretor">Corretor</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="dev">Desenvolvedor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Controles de paginação superiores */}
      {filteredUsers.length > itemsPerPage && (
        <PaginationControls position="top" />
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="dark:text-white">Nome</TableHead>
              <TableHead className="dark:text-white">Username</TableHead>
              <TableHead className="dark:text-white">Email</TableHead>
              <TableHead className="dark:text-white">Cargo</TableHead>
              <TableHead className="dark:text-white">Status</TableHead>
              <TableHead className="dark:text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((user) => (
              <TableRow key={user.id} className="dark:border-gray-700 hover:dark:bg-gray-700">
                <TableCell className="dark:text-gray-300">{user.name}</TableCell>
                <TableCell className="dark:text-gray-300">{user.username}</TableCell>
                <TableCell className="dark:text-gray-300">{user.email}</TableCell>
                <TableCell className="dark:text-gray-300">{user.role}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.active}
                    onCheckedChange={(checked) => {
                      // Desenvolvedores podem ativar/desativar qualquer usuário
                      if (currentUser?.role === 'dev') {
                        handleToggleActive(user.id, checked);
                      } else if (currentUser?.role === 'admin') {
                        handleToggleActive(user.id, checked);
                      } else {
                        setNoPermission(true);
                      }
                    }}
                    className={`
                      ${user.active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                      text-white
                      ${currentUser?.role === 'admin' && user.role === 'corretor' || currentUser?.role === 'dev'
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'}
                    `}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700"
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Desenvolvedores podem excluir qualquer conta
                        if (currentUser?.role === 'dev') {
                          setConfirmDelete(user.id);
                        } else if (currentUser?.role === 'admin') {
                          // Administradores só podem excluir corretores
                          if (user.role === 'corretor') {
                            setConfirmDelete(user.id);
                          } else {
                            setNoPermission(true);
                          }
                        } else {
                          setNoPermission(true);
                        }
                      }}
                      className={`
                        ${(currentUser?.role === 'dev') || (currentUser?.role === 'admin' && user.role === 'corretor')
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-gray-500 hover:bg-gray-600'}
                        text-white ${
                          currentUser?.role === 'dev' || (currentUser?.role === 'admin' && user.role === 'corretor')
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed'
                        }
                      `}
                    >
                      <Trash className="h-4 w-4 mr-2" /> Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length > itemsPerPage && (
        <PaginationControls position="bottom" />
      )}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Confirmar Exclusão</h2>
            <p className="mb-6 dark:text-gray-300">Tem certeza que deseja excluir este usuário?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => confirmDeleteUser()}
                className="bg-gray-800 hover:bg-gray-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
      {noPermission && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Acesso Negado</h2>
            <p className="mb-6 dark:text-gray-300">Você não tem permissão para executar esta ação.</p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setNoPermission(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
