
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-eliteBlue">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="text-center px-4">
          <h1 className="text-9xl font-bold text-eliteOrange mb-4">404</h1>
          <p className="text-2xl text-white mb-8">Oops! Página não encontrada</p>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            A página que você está procurando pode ter sido removida, renomeada ou está temporariamente indisponível.
          </p>
          <Button className="bg-eliteOrange hover:bg-eliteOrange-light text-white">
            <Link to="/">Voltar para Página Inicial</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
