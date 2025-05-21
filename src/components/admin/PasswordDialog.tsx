import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/TempAuthContext';

interface PasswordDialogProps {
  onConfirm: () => void;
}

const PasswordDialog = ({ onConfirm }: PasswordDialogProps) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyPassword = async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (signInError) {
        if (signInError.message.includes('incorrect password')) {
          throw new Error('Senha incorreta');
        } else if (signInError.message.includes('user not found')) {
          throw new Error('Usuário não encontrado');
        } else if (signInError.message.includes('network error')) {
          throw new Error('Erro de rede. Por favor, tente novamente mais tarde.');
        } else if (signInError.message.includes('rate limit')) {
          throw new Error('Muitas tentativas. Por favor, aguarde alguns minutos.');
        } else {
          throw new Error('Erro ao verificar senha. Por favor, tente novamente.');
        }
      }

      onConfirm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao verificar senha. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Excluir</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmação de Exclusão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Por favor, digite sua senha para confirmar a exclusão do cliente.
          </p>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPassword('')}>
              Cancelar
            </Button>
            <Button
              onClick={handleVerifyPassword}
              disabled={isLoading || password.length === 0}
            >
              {isLoading ? 'Verificando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;
