
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-eliteBlue border-t border-muted">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src="/src/img/icon.png" 
                alt="Elite House" 
                className="h-10"
              />
            </div>
            <p className="text-muted-foreground mb-6">
              Seu parceiro de confiança para encontrar o imóvel dos seus sonhos. Estamos no mercado há mais de 15 anos oferecendo as melhores oportunidades.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-eliteOrange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://www.instagram.com/elitepiracicaba/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-eliteOrange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
              <a href="#" className="text-white hover:text-eliteOrange">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-eliteOrange transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-muted-foreground hover:text-eliteOrange transition-colors">
                  Comprar
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-eliteOrange transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-eliteOrange transition-colors">
                  Contato
                </Link>
              </li>

            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="text-eliteOrange" size={18} />
                <span className="text-muted-foreground">Rua São João, 349 - Centro, Piracicaba - SP</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-eliteOrange" size={18} />
                <span className="text-muted-foreground">+55 19 98454-5862</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-eliteOrange" size={18} />
                <span className="text-muted-foreground">elitehousepiracicaba@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-muted mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Elite House. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
