
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    }, 1500);
    
    // Note: In a real implementation, here's where we would connect to Supabase
    // to send the form data to the database
    // For example:
    /*
    const { data, error } = await supabase
      .from('contacts')
      .insert([formData]);
    
    if (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } else {
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }
    */
  };

  return (
    <div className="min-h-screen flex flex-col bg-eliteBlue">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-eliteBlue-light py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Entre em Contato
            </h1>
            <p className="text-xl text-white/80">
              Estamos prontos para ajudar você a encontrar o imóvel ideal
            </p>
          </div>
        </div>
        
        {/* Contact Info & Form */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-3xl font-bold text-eliteBlue mb-6">Informações de Contato</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-eliteOrange p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl text-white mb-2">Nosso Endereço</h3>
                      <p className="text-muted-foreground">
                        Av. Paulista, 1000<br />
                        Bela Vista, São Paulo - SP<br />
                        CEP: 01310-100
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-eliteOrange p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl text-white mb-2">Telefones</h3>
                      <p className="text-muted-foreground">
                        +55 (11) 5555-1234<br />
                        +55 (11) 91234-5678
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-eliteOrange p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl text-white mb-2">Email</h3>
                      <p className="text-muted-foreground">
                        contato@elitehouse.com<br />
                        vendas@elitehouse.com
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Map Placeholder - Would be replaced with actual map */}
                <div className="mt-8 rounded-lg overflow-hidden h-[300px] bg-muted">
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Mapa será integrado aqui usando Google Maps ou Mapbox via Supabase
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div>
                <div className="bg-card p-8 rounded-lg">
                  <h2 className="text-2xl font-bold text-eliteBlue mb-6">Envie uma Mensagem</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input 
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="bg-muted border-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-muted border-muted"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="bg-muted border-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input 
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="bg-muted border-muted"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem</Label>
                      <Textarea 
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="bg-muted border-muted resize-none"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-eliteOrange hover:bg-eliteOrange-light text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* WhatsApp CTA */}
        <section className="py-12 bg-eliteOrange/10">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Prefere o WhatsApp?
                </h2>
                <p className="text-white/80">
                  Entre em contato diretamente pelo nosso WhatsApp para atendimento rápido.
                </p>
              </div>
              <a 
                href="https://wa.me/5511912345678" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path><path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path><path d="M9 14a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0-.5.5Z"></path></svg>
                  Fale pelo WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
