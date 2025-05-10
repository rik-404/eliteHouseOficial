
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Team members data
const teamMembers = [
  {
    name: 'Carlos Oliveira',
    role: 'CEO & Fundador',
    bio: 'Com mais de 20 anos de experiência no mercado imobiliário, Carlos fundou a Elite House com o objetivo de oferecer um serviço personalizado de alto padrão.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Ana Soares',
    role: 'Diretora de Vendas',
    bio: 'Especialista em negociações de alto valor, Ana lidera nossa equipe de vendas com foco em resultados e atendimento diferenciado para cada cliente.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Roberto Santos',
    role: 'Corretor Sênior',
    bio: 'Especializado em imóveis de luxo e com profundo conhecimento do mercado, Roberto é reconhecido por encontrar as melhores oportunidades para investidores.',
    image: 'https://images.unsplash.com/photo-1556157382-97eda2f9296e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Juliana Costa',
    role: 'Consultora Imobiliária',
    bio: 'Com formação em arquitetura, Juliana traz uma perspectiva diferenciada na avaliação de imóveis e na identificação de oportunidades para nossos clientes.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-eliteBlue">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-eliteBlue-light py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sobre a Elite House
            </h1>
            <p className="text-xl text-white/80">
              Conheça nossa história e equipe de especialistas
            </p>
          </div>
        </div>
        
        {/* Company Story */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Nossa História</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Fundada em 2005, a Elite House nasceu com o objetivo de revolucionar o mercado imobiliário, trazendo um atendimento personalizado e focado nas reais necessidades de cada cliente.
                  </p>
                  <p>
                    O que começou como uma pequena empresa com apenas três corretores, hoje se transformou em uma das referências no mercado de imóveis de alto padrão, com uma equipe especializada e mais de 1000 negociações realizadas com sucesso.
                  </p>
                  <p>
                    Nossa missão é proporcionar a melhor experiência na busca pelo imóvel ideal, seja para moradia ou investimento, com transparência, ética e compromisso com a satisfação dos nossos clientes.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    alt="Elite House Office" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-5 -right-5 bg-eliteOrange text-white p-4 text-lg font-semibold rounded">
                  Desde 2005
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 bg-eliteBlue-light">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-card rounded-lg">
                <div className="text-4xl font-bold text-eliteOrange mb-2">+1000</div>
                <div className="text-eliteOrange font-medium">Imóveis Vendidos</div>
              </div>
              <div className="text-center p-6 bg-card rounded-lg">
                <div className="text-4xl font-bold text-eliteOrange mb-2">18</div>
                <div className="text-eliteOrange font-medium">Anos no Mercado</div>
              </div>
              <div className="text-center p-6 bg-card rounded-lg">
                <div className="text-4xl font-bold text-eliteOrange mb-2">15</div>
                <div className="text-eliteOrange font-medium">Corretores Especializados</div>
              </div>
              <div className="text-center p-6 bg-card rounded-lg">
                <div className="text-4xl font-bold text-eliteOrange mb-2">98%</div>
                <div className="text-eliteOrange font-medium">Clientes Satisfeitos</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Nossa Equipe</h2>
              <p className="section-subtitle">Conheça os especialistas que farão a diferença no seu negócio</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index} 
                  className="bg-card rounded-lg overflow-hidden hover:shadow-lg hover:shadow-eliteOrange/10 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                    <p className="text-eliteOrange mb-3">{member.role}</p>
                    <p className="text-muted-foreground">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="py-16 bg-eliteBlue-light">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title text-eliteOrange">Nossos Valores</h2>
              <p className="section-subtitle">Os princípios que guiam nosso trabalho todos os dias</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-lg border border-muted hover:border-eliteOrange transition-all duration-300 relative">
                <h3 className="text-xl font-semibold text-eliteOrange mb-4 absolute inset-x-0 top-0 bg-card px-6 py-3">Excelência</h3>
                <p className="text-muted-foreground">
                  Buscamos constantemente aprimorar nossos processos e serviços para oferecer o mais alto padrão de qualidade em cada interação com nossos clientes.
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-muted hover:border-eliteOrange transition-all duration-300 relative">
                <h3 className="text-xl font-semibold text-eliteOrange mb-4 absolute inset-x-0 top-0 bg-card px-6 py-3">Transparência</h3>
                <p className="text-muted-foreground">
                  Acreditamos que relacionamentos duradouros são construídos com base na honestidade e clareza em todas as etapas da negociação.
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border border-muted hover:border-eliteOrange transition-all duration-300 relative">
                <h3 className="text-xl font-semibold text-eliteOrange mb-4 absolute inset-x-0 top-0 bg-card px-6 py-3">Compromisso</h3>
                <p className="text-muted-foreground">
                  Estamos dedicados a entender as necessidades específicas de cada cliente e trabalhar incansavelmente para superar suas expectativas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
