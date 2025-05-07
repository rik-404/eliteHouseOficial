
import React from 'react';

const testimonials = [
  {
    name: "Marina Silva",
    role: "Compradora",
    testimonial: "Encontrar meu apartamento foi muito mais fácil do que eu esperava, graças à equipe da Elite House. Eles entenderam exatamente o que eu estava procurando desde o primeiro dia.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1522&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Rafael Mendes",
    role: "Investidor",
    testimonial: "Como investidor imobiliário, valorizo muito a transparência e agilidade. A Elite House superou minhas expectativas em todas as negociações que fizemos nos últimos anos.",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Juliana Costa",
    role: "Vendedora",
    testimonial: "Vendi meu imóvel em tempo recorde e por um valor acima do que eu esperava. A estratégia de marketing da Elite House foi fundamental para atrair compradores qualificados.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">O Que Dizem Nossos Clientes</h2>
          <p className="section-subtitle">A satisfação de quem realizou o sonho com a Elite House</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-black p-6 rounded-lg border border-muted hover:border-eliteOrange transition-all duration-300 flex flex-col animate-slide-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-6">
                <svg 
                  className="h-8 w-8 text-eliteOrange/50" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              
              <blockquote className="text-white mb-6 flex-grow">
                "{testimonial.testimonial}"
              </blockquote>
              
              <div className="flex items-center mt-4">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-white font-medium">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
