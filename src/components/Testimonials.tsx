
import React, { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const testimonials = [
  {
    name: "Camila Santos",
    role: "Compradora",
    testimonial: "Gostaria de agradecer muito a corretora Yasmin, que me ajudou na compra do meu primeiro apartamento. Eu havia tido uma decepção muito grande com outro profissional, e quando conheci a Yasmin já estava muito frustrada. Tive algumas dificuldades ao longo do caminho, mas seguindo todas as orientações da Yasmin, consegui realizar meu sonho. Fui surpreendida pela paciência, pela dedicação e educação da Yasmin, sempre com muita clareza, tirou todas as minhas dúvidas e me deu todo suporte necessário até mesmo após o contrato assinado. Eu já indiquei e continuo indicando ❤",
    image: "/images/testimonials/camila-santos.jpg"
  },
  {
    name: "Edivan Carlos da Silva",
    role: "Comprador",
    testimonial: "Quero agradecer primeiramente a DEUS por ter me concedido essa benção tão grande em minha vida, me faltam palavras pra expressar tanta alegria por DEUS ter colocado pessoas tão importantes no meu caminho. A Luciana foi maravilhosa, deixou a gente tão seguro de tudo. Também quero agradecer a Cataguá por tudo, por estar com a gente. Nossa sonho da casa própria foi realizado. Foi uma alegria tão grande que não tenho palavras para definir tamanha felicidade. Durante todo o processo de construção, a Elite House sonhou e idealizou junto com a gente cada detalhe do nosso imóvel. Tudo feito com muito profissionalismo.",
    image: "/images/testimonials/edivan-silva.jpg"
  },
  {
    name: "Lucas França Siqueira",
    role: "Comprador",
    testimonial: "Comprar meu imóvel com o corretor Anderson Siqueira foi uma experiência sensacional. Muito profissional e sabe se comunicar muito bem, fácil de entender o que ele está dizendo, nos passando total confiança na compra do imóvel.",
    image: "/images/testimonials/lucas-franca.jpg"
  },
  {
    name: "Lucas Henrique Oliveira Monteiro",
    role: "Comprador",
    testimonial: "Olá eu sou Lucas, comprei um imóvel recentemente e estou feliz com a aquisição, me passaram o contato do Anderson quando estava à procura de algo que se encaixasse no meu orçamento. Estava passando por algumas simulações a 1 ano e nada chegava em algo bom e assim que entrei em contato com ele tudo foi resolvido bem rápido, me passou confiança, me ajudou a tirar minhas dúvidas e a conquistar meu futuro novo lar. Sou muito grato pelo bom trabalho e desejo muito sucesso para esse profissional incrível.",
    image: "/images/testimonials/lucas-monteiro.jpg"
  }
];

const Testimonials = () => {
  const sliderRef = useRef<Slider>(null);

  // Configurações do slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      }
    ]
  };

  return (
    <section className="py-16 bg-black/90 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          O Que Dizem Nossos Clientes
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          A satisfação de quem realizou o sonho com a Elite House
        </p>
        
        <Slider {...settings} className="testimonial-slider">
          {testimonials.map((testimonial, index) => (
            <div key={index}>
              <div className="h-full flex flex-col items-center justify-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="testimonial-image"
                  onError={(e) => {
                    // Fallback para imagem quebrada
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-user.jpg';
                  }}
                />
                <p className="testimonial-text text-center">"{testimonial.testimonial}"</p>
                <div className="mt-auto">
                  <h4 className="testimonial-name">{testimonial.name}</h4>
                  <p className="testimonial-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
