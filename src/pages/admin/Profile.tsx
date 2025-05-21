import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/TempAuthContext';
import { User } from '@/types/user';
import { supabase } from '@/lib/supabase';


interface ProfileForm extends Omit<User, 'password'> {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<ProfileForm | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      // Removendo a senha atual do estado para segurança
      const userData = { ...user };
      delete userData.password;
      setFormData(userData);
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) {
      setPasswordError('Dados não carregados. Por favor, tente novamente.');
      return;
    }

    if (submitLoading) {
      setPasswordError('Já está processando uma solicitação. Por favor, aguarde.');
      return;
    }

    try {
      // Validar senhas se foram fornecidas
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setPasswordError('Por favor, informe a senha atual');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setPasswordError('As novas senhas não coincidem');
          return;
        }
      }

      setSubmitLoading(true);

      const updateData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        address: formData.address,
        birth: formData.birth,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone,
        role: formData.role,
        active: formData.active,
        updated_at: new Date().toISOString()
      } as User;

      if (formData.newPassword) {
        // Criptografar a nova senha
        const hashedPassword = formData.newPassword;
        updateData.password = hashedPassword;
      }

      console.log('Dados enviados para atualização:', updateData);

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', formData.id)
        .select('*');

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Erro detalhado:', error);
        setPasswordError('Erro ao salvar as alterações. Por favor, tente novamente.');
        return;
      }

      if (!data || data.length === 0) {
        setPasswordError('Erro ao salvar as alterações. Por favor, tente novamente.');
        return;
      }

      // Atualizar o usuário no estado de autenticação
      const updatedUser = data[0];
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Limpar os campos de senha
      setFormData(prev => prev ? {
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      } : null);

      // Mostrar mensagem de sucesso
      setSuccessMessage('Perfil atualizado com sucesso!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      localStorage.setItem('currentUser', JSON.stringify(data[0]));
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setPasswordError('Erro ao salvar as alterações. Por favor, tente novamente.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading || !formData) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Editar Perfil</h1>
        <Button
          onClick={() => navigate('/admin')}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Voltar
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {passwordError && (
          <div className="p-4 text-red-500 bg-red-50 rounded-md mb-6">
            {passwordError}
          </div>
        )}
        {successMessage && (
          <div className="p-4 text-green-500 bg-green-50 rounded-md mb-6">
            {successMessage}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4" id="personal-info">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                name: e.target.value
              } : prev)}
            />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                username: e.target.value
              } : prev)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                email: e.target.value
              } : prev)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                phone: e.target.value
              } : prev)}
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              value={formData.cpf || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                cpf: e.target.value
              } : prev)}
            />
          </div>
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                address: e.target.value
              } : prev)}
            />
          </div>
          <div>
            <Label htmlFor="birth">Data de Nascimento</Label>
            <Input
              id="birth"
              name="birth"
              type="date"
              value={formData.birth || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                birth: e.target.value
              } : prev)}
            />
          </div>
          <div>
            <Label htmlFor="emergency_contact">Contato de Emergência</Label>
            <Input
              id="emergency_contact"
              name="emergency_contact"
              value={formData.emergency_contact || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                emergency_contact: e.target.value
              } : prev)}
            />
          </div>
          <div>
            <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
            <Input
              id="emergency_phone"
              name="emergency_phone"
              value={formData.emergency_phone || ''}
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                emergency_phone: e.target.value
              } : prev)}
            />
          </div>
        </div>

        <div className="space-y-4" id="password-section">
          <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>
          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Digite sua senha atual"
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                currentPassword: e.target.value
              } : null)}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Digite sua nova senha"
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                newPassword: e.target.value
              } : null)}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirme sua nova senha"
              onChange={(e) => setFormData(prev => prev ? {
                ...prev,
                confirmPassword: e.target.value
              } : null)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" onClick={() => navigate('/admin')} variant="outline">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={submitLoading}
          >
            {submitLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;