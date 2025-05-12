
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-eliteBlue/95 backdrop-blur-sm border-b border-muted">
      <div className="container-custom flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/icon.png" 
              alt="Elite House" 
              className="h-10" 
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-white hover:text-eliteOrange transition-colors">
            Início
          </Link>
          <Link to="/properties" className="text-white hover:text-eliteOrange transition-colors">
            Comprar
          </Link>
          <Link to="/about" className="text-white hover:text-eliteOrange transition-colors">
            Sobre
          </Link>
          <Link to="/contact" className="text-white hover:text-eliteOrange transition-colors">
            Contato
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          className="md:hidden text-white hover:bg-eliteBlue-light"
          onClick={toggleMenu}
        >
          <Menu />
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-eliteBlue border-t border-muted ${isOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col px-4 py-4 space-y-4">
          <Link 
            to="/" 
            className="text-white hover:text-eliteOrange transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            Início
          </Link>
          <Link 
            to="/properties" 
            className="text-white hover:text-eliteOrange transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            Comprar
          </Link>
          <Link 
            to="/about" 
            className="text-white hover:text-eliteOrange transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            Sobre
          </Link>
          <Link 
            to="/contact" 
            className="text-white hover:text-eliteOrange transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            Contato
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
