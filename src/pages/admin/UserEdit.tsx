import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import CustomForm from '@/components/ui/CustomForm';

const UserEdit = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', localStorage.getItem('currentUser'))
          .single();

        if (error) throw error;
        setCurrentUser(data);
      } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
      }
    };

    fetchCurrentUser();
  }, []);
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setError('Erro ao carregar usuário. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Verificar se as senhas coincidem
    if (user.password && user.password !== user.confirmPassword) {
      setError('As senhas não coincidem. Por favor, digite senhas iguais.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          cpf: user.cpf,
          emergencyContact: user.emergencyContact,
          emergency_contact: user.emergency_contact,
          emergency_phone: user.emergency_phone,
          birth: user.birth,
          active: user.active,
          role: user.role,
          password: user.password || undefined,
          address: user.address
        })
        .eq('id', id);

      if (error) throw error;

      navigate('/admin/users');
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError('Erro ao atualizar usuário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user) return <div>Usuário não encontrado</div>;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Editar Usuário</CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/users')}
              className="bg-orange-500 hover:bg-orange-600 text-gray-900"
            >
              Voltar para Usuários
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           <CustomForm onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                <Input
                  id="username"
                  value={user.username || ''}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={user.phone || ''}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={user.password || ''}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  placeholder="Deixe em branco para manter a senha atual"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={user.confirmPassword || ''}
                  onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                  placeholder="Deixe em branco para manter a senha atual"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={user.cpf || ''}
                  onChange={(e) => setUser({ ...user, cpf: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact">Contato de Emergência</Label>
                <Input
                  id="emergency_contact"
                  value={user.emergency_contact || ''}
                  onChange={(e) => setUser({ ...user, emergency_contact: e.target.value })}
                  placeholder="Nome do contato de emergência"
                />
              </div>
              <div>
                <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
                <Input
                  id="emergency_phone"
                  type="tel"
                  value={user.emergency_phone || ''}
                  onChange={(e) => setUser({ ...user, emergency_phone: e.target.value })}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="birth">Data de Nascimento</Label>
                <Input
                  id="birth"
                  type="date"
                  value={user.birth || ''}
                  onChange={(e) => setUser({ ...user, birth: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={user.active}
                    onCheckedChange={(checked) => setUser({ ...user, active: checked })}
                  />
                  <Label htmlFor="active">Usuário Ativo</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="role">Cargo <span className="text-red-500">*</span></Label>
                <Select
                  value={user.role}
                  onValueChange={(value) => setUser({ ...user, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === 'admin' ? (
                      <>
                        <SelectItem value="corretor">Corretor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="dev">Desenvolvedor</SelectItem>
                      </>
                    ) : (
                      <SelectItem value="corretor">Corretor</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={user.address || ''}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP, 01000-000"
                  className="h-16"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </CustomForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEdit;
