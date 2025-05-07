import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
        throw signInError;
      }

      onConfirm();
    } catch (err) {
      setError('Senha incorreta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
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
