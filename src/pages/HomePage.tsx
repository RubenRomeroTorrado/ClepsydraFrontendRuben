import React from 'react';
import { Link } from 'react-router-dom';
import logoC from '../assets/images/logo_c.png';

const HomePage: React.FC = () => {
  return (
    <div className="bg-black min-h-screen flex flex-col justify-between">
      {/* Área central que empurra o rodapé para baixo */}
      <div className="flex-1 flex items-center justify-center">
        <Link to="/about-c">
          <img
            src={logoC}
            alt="Clepsydra Project Logo"
            className="project-logo clepsydra-logo"
            loading="eager"
          />
        </Link>
      </div>

      {/* Rodapé sem position fixed */}
      <footer className="home-footer">
        <p className="text-xs text-gray-400">
          Developed by Diogo Pinto |
          <a
            href="https://github.com/clepsydraisa/clepsydra_isa"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            clepsydraisa/clepsydra_isa
          </a>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;