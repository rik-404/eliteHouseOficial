import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import icon from '@/img/icon-name.png';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CustomForm from '@/components/ui/CustomForm';
const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Tentando fazer login com:', { username });

    try {
      await signIn(username, password);
      console.log('Login bem-sucedido');
      // Adicionando um pequeno delay antes do redirecionamento
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 500);
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error instanceof Error ? error.message : 'Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#141424] rounded-lg shadow-md">
        <div className="space-y-8 text-center">
          <img src={icon} alt="Ícone" className="w-24 h-24 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-white">Área Administrativa</h2>

        </div>
        
          <div className="p-4 text-red-500 bg-white rounded-md shadow-sm">
            {error === 'Usuário inativo' ? 'Este usuário está inativo. Entre em contato com o administrador.' : error ? 'Usuário ou senha inválidos' : ''}
          </div>

        <CustomForm onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-white">Usuário</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-eliteOrange hover:bg-eliteOrange-light"
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </Button>
          <div className="mt-4 flex justify-center">
            <button onClick={() => navigate('/')} className="text-white hover:text-gray-300">
              Voltar para tela inicial
            </button>
          </div>
        </CustomForm>


      </div>
    </div>
  );
};

export default Login;
