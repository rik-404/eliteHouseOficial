import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Toast } from '@/components/ui/toast';

interface ModalContactProps {
  propertiesId?: string;
}

const ModalContact = ({ propertiesId }: ModalContactProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    properties_id: propertiesId || '',
    property_name: ''
  });

  useEffect(() => {
    if (propertiesId) {
      // Buscar o nome do empreendimento no banco de dados
      const fetchPropertyName = async () => {
        try {
          const { data, error } = await supabase
            .from('properties')
            .select('title')
            .eq('id', propertiesId)
            .single();

          if (error) throw error;
          setFormData(prev => ({
            ...prev,
            property_name: data?.title || 'Nenhum'
          }));
        } catch (error) {
          console.error('Erro ao buscar nome do empreendimento:', error);
          setFormData(prev => ({
            ...prev,
            property_name: 'Nenhum'
          }));
        }
      };

      fetchPropertyName();
    }
  }, [propertiesId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Criar novo cliente pendente no Supabase
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            status: 'pending',
            notes: formData.message,
            properties_id: formData.properties_id,
            property_name: formData.property_name
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Nossa equipe entrará em contato em breve."
      });

      setIsOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        properties_id: '',
        property_name: ''
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-full rounded-full bg-eliteOrange hover:bg-eliteOrange-light text-white font-semibold py-3 text-base transition">
          Entrar em contato
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entre em contato conosco</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Digite sua mensagem aqui..."
              className="min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalContact;
