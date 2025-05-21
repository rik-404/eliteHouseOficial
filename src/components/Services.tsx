
import React from 'react';
import { Home, Search, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: <Search className="h-10 w-10 text-eliteOrange" />,
    title: 'Busque Seu Imóvel',
    description: 'Encontre o imóvel dos seus sonhos com nosso avançado sistema de busca e filtragem.',
    link: '/properties'
  },
  {
    icon: <User className="h-10 w-10 text-eliteOrange" />,
    title: 'Consultoria Especializada',
    description: 'Nossos corretores estão prontos para ajudar você a tomar a melhor decisão para sua família.',
    link: '/about'
  },
  {
    icon: <Home className="h-10 w-10 text-eliteOrange" />,
    title: 'Avaliação de Imóveis',
    description: 'Precisa vender seu imóvel? Oferecemos avaliação profissional para ajudá-lo a definir o melhor preço.',
    link: '/contact'
  }
];

const Services = () => {
  return (
    <section className="py-16 bg-eliteBlue-light">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title text-eliteOrange">Nossos Serviços</h2>
          <p className="section-subtitle">Conheça como a Elite House pode ajudá-lo</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-card p-6 rounded-lg border border-muted hover:border-eliteOrange transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-eliteOrange mb-3 border border-muted/50 shadow-sm px-2 py-1 rounded-md inline-block">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {service.description}
              </p>
              <Link to={service.link}>
                <Button 
                  variant="ghost" 
                  className="text-eliteOrange hover:text-eliteOrange-light hover:bg-transparent p-0 group"
                >
                  Saiba Mais
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
