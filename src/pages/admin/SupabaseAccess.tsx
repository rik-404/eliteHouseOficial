import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const SupabaseAccess = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const handleGrantAccess = async () => {
    try {
      setLoading(true);
      setMessage('');

      if (!email) {
        setMessage('Por favor, insira um email');
        return;
      }

      // Verificar se o usuário já existe
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Se o usuário não existe, criar um novo
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email,
            role: 'admin',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      setMessage('Acesso concedido com sucesso!');
    } catch (error) {
      console.error('Erro ao conceder acesso:', error);
      setMessage('Erro ao conceder acesso: ' + (error?.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Gerenciar Acesso ao Supabase</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email do usuário</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o email do usuário"
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleGrantAccess}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Concedendo acesso...' : 'Conceder acesso'}
        </Button>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseAccess;
