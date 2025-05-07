import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';

interface UserFormProps {
  user?: User;
}

const UserForm = ({ user }: UserFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: user?.id || '',
    username: user?.username || '',
    password: '',
    role: user?.role || 'user',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    address: user?.address || '',
    birth: user?.birth || '',
    emergency_contact: user?.emergency_contact || '',
    emergency_phone: user?.emergency_phone || '',
    active: user?.active || true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Função auxiliar para garantir que o ID seja sempre string
  const getValidId = (id: string | undefined): string => {
    if (!id) return '';
    return id.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (user) {
        // Update existing user
        await supabase
          .from('users')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', getValidId(user.id));
      } else {
        // Create new user
        await supabase
          .from('users')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
      }

      navigate('/admin/users');
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="username">Usuário</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="role">Cargo</Label>
          <Select
            name="role"
            value={formData.role}
            onValueChange={(value) => handleChange({
              target: { name: 'role', value }
            } as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="birth">Data de Nascimento</Label>
          <Input
            id="birth"
            name="birth"
            type="date"
            value={formData.birth}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="emergency_contact">Contato de Emergência</Label>
          <Input
            id="emergency_contact"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
          <Input
            id="emergency_phone"
            name="emergency_phone"
            value={formData.emergency_phone}
            onChange={handleChange}
          />
        </div>

        <div className="col-span-full">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Deixe em branco para manter a senha atual"
          />
        </div>

        <div className="col-span-full">
          <div className="flex items-center gap-2">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
            />
            <Label htmlFor="active">Usuário Ativo</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/users')}
        >
          Cancelar
        </Button>
        <Button type="submit" className="bg-eliteOrange hover:bg-eliteOrange-light">
          {user ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
