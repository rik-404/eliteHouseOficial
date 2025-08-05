
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative h-[80vh] flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-eliteBlue/90 to-eliteBlue/70"></div>
      </div>
      
      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Encontre o Lar Perfeito para sua Família
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Oferecemos as melhores opções de imóveis em localizações privilegiadas. 
            Conte com nossa experiência para realizar o sonho da sua casa própria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-eliteOrange hover:bg-eliteOrange-light text-white">
              <Link to="/imoveis" className="flex items-center">
                Ver Imóveis
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-eliteBlue text-eliteBlue hover:bg-eliteBlue/10">
              <Link to="/contato" className="flex items-center">
                Fale Conosco
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
