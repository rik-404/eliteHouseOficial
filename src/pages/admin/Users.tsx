          import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '../../types/user';
import { PasswordConfirmationModal } from '@/components/admin/PasswordConfirmationModal';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>('all');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [noPermission, setNoPermission] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user: currentUser, confirmPassword } = useAuth();

  useEffect(() => {
    fetchUsers();
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
      setTargetUserId(userId);
      setShowPasswordModal(true);
    } catch (error) {
      console.error('Erro ao iniciar processo de exclusão:', error);
    }
  };

  const confirmDeleteWithPassword = async () => {
    try {
      if (!targetUserId) return;

      setLoading(true);
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', targetUserId);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== targetUserId));
      setConfirmDelete(null);
      setTargetUserId(null);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    } finally {
      setLoading(false);
      setShowPasswordModal(false);
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <Button 
          onClick={() => navigate('/admin/users/create')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Novo Usuário
        </Button>
        <PasswordConfirmationModal
          open={showPasswordModal}
          onConfirm={confirmDeleteWithPassword}
          onClose={() => {
            setShowPasswordModal(false);
            setTargetUserId(null);
          }}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div className="w-48">
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger>
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
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
                      className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentUser?.role === 'admin') {
                          if (user.role === 'corretor') {
                            setConfirmDelete(user.id);
                          } else {
                            setNoPermission(true);
                          }
                        } else if (currentUser?.role === 'dev') {
                          setConfirmDelete(user.id);
                        } else {
                          setNoPermission(true);
                        }
                      }}
                      className={`
                        ${currentUser?.role === 'admin' && user.role === 'corretor' || currentUser?.role === 'dev'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-gray-500 hover:bg-gray-600'}
                        text-white ${
                          (currentUser?.role === 'admin' && user.role === 'corretor') || currentUser?.role === 'dev'
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed'
                        }
                      `}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirmar Exclusão</h2>
            <p className="mb-6">Tem certeza que deseja excluir este usuário?</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDelete(confirmDelete)}
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
      {noPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Acesso Negado</h2>
            <p className="mb-6">Você não tem permissão para editar este usuário.</p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setNoPermission(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white"
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
