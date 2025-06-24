import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';

import { useNavigate } from 'react-router-dom';
import { User } from '../../types/user';
import { useAuth } from '@/contexts/TempAuthContext';
import CustomForm from '@/components/ui/CustomForm';

const CreateUser = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birth, setBirth] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [role, setRole] = useState('corretor');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [roleOptions, setRoleOptions] = useState([
    { value: 'corretor', label: 'Corretor' }
  ]);

  useEffect(() => {
    // Desenvolvedores podem criar usuários em qualquer nível
    if (user?.role === 'dev') {
      setRoleOptions([
        { value: 'admin', label: 'Administrador' },
        { value: 'dev', label: 'Desenvolvedor' },
        { value: 'corretor', label: 'Corretor' }
      ]);
    } else if (user?.role === 'admin') {
      // Administradores só podem criar corretores
      setRoleOptions([
        { value: 'corretor', label: 'Corretor' }
      ]);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar senha
    if (!password || password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    // Validar força da senha
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumber)) {
      setError('A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      // Verificar permissões
      if (user?.role !== 'dev' && role !== 'corretor') {
        setError('Você não tem permissão para criar usuários com este nível de acesso.');
        return;
      }

      // Criar o usuário diretamente na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            role,
            name,
            username,
            email,
            cpf,
            phone,
            address,
            password: password, // A senha será armazenada como texto (será criptografada no banco)
            birth,
            emergency_contact: emergencyContact,
            emergency_phone: emergencyPhone,
            active: active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
        ])
        .select();

      console.log('User data:', userData);
      console.log('User error:', userError);

      if (userError) {
        if (userError.message.includes('duplicate')) {
          setError('Este username já está em uso. Por favor, escolha outro nome de usuário.');
        } else {
          setError(`Erro ao criar usuário: ${userError.message}`);
        }
        throw userError;
      }

      if (!userData?.[0]) {
        setError('Não foi possível criar o usuário. Por favor, tente novamente.');
        throw new Error('User not created');
      }

      navigate('/admin/users');
    } catch (error) {
      if (error instanceof Error) {
        setError(`Erro ao criar usuário: ${error.message}`);
      } else {
        setError('Erro inesperado ao criar usuário. Por favor, tente novamente.');
      }
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Criar Novo Usuário</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/users')}
          className="bg-orange-500 hover:bg-orange-600 text-gray-900"
        >
          Voltar para Usuários
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <CustomForm onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome de usuário"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label>
              <Input
                id="cpf"
                type="text"
                value={cpf}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setCpf(value);
                  }
                }}
                placeholder="Apenas números"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setPhone(value);
                  }
                }}
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP, 01000-000"
                className="h-16"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite uma senha forte"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha <span className="text-red-500">*</span></Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a senha"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="birth">Data de Nascimento</Label>
              <Input
                id="birth"
                type="date"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="emergencyContact">Contato de Emergência</Label>
              <Input
                id="emergencyContact"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Nome do contato de emergência"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Telefone de emergência"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Cargo</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="active">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <span>Ativo</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </CustomForm>
      </div>
    </div>
  );
}

export default CreateUser;
