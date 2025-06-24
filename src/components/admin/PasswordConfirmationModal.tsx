import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/TempAuthContext';
import CustomForm from '@/components/ui/CustomForm';

interface PasswordConfirmationModalProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const PasswordConfirmationModal: React.FC<PasswordConfirmationModalProps> = ({ open, onConfirm, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { confirmPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const isValid = await confirmPassword(password);
      if (isValid) {
        onConfirm();
        setPassword('');
        onClose();
      } else {
        setError('Senha incorreta');
      }
    } catch (error) {
      setError('Erro ao verificar senha');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmação de Senha</DialogTitle>
        </DialogHeader>
        <CustomForm onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Digite sua senha para confirmar
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Confirmar
            </Button>
          </div>
        </CustomForm>
      </DialogContent>
    </Dialog>
  );
};
