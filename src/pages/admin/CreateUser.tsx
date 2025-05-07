import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/user';
import { useAuth } from '@/contexts/AuthContext';

const CreateUser = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birth, setBirth] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [emergencyPhone, setEmergencyPhone] = useState(null);
  const [role, setRole] = useState('corretor');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const roleOptions = [
    { value: 'corretor', label: 'Corretor' }
  ];

  if (currentUser?.role === 'dev') {
    roleOptions.unshift(
      { value: 'admin', label: 'Administrador' },
      { value: 'dev', label: 'Desenvolvedor' }
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar o usuário diretamente na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            role,
            name,
            username,
            email,
            password: password, // Armazenamos a senha aqui
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
      <h1 className="text-2xl font-semibold">Criar Novo Usuário</h1>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
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
          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={() => navigate('/admin/users')}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;
