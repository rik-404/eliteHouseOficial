
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1617440168937-c6497eaa1db3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-eliteBlue to-eliteBlue/80"></div>
      </div>
      
      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para encontrar o imóvel dos seus sonhos?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Entre em contato com nossos especialistas e descubra como podemos ajudar você a fazer o melhor negócio.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-eliteOrange hover:bg-eliteOrange-light text-white"
            >
              <Link to="/imoveis">Ver Imóveis</Link>
            </Button>
            <Button 
              size="lg" 
              variant="primary"
              className="bg-eliteOrange hover:bg-eliteOrange-light text-white"
            >
              <Link to="/contato">Fale Conosco</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
