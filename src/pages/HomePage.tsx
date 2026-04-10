import React from 'react';
import { Link } from 'react-router-dom';
import logoC from '../assets/images/logo_c2.jpg';

const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Imagem de fundo que ocupa 93% da tela */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[93%] h-[93%]">
          <Link to="/about-c" className="block w-full h-full">
            <img
              src={logoC}
              alt="Clepsydra Project Logo"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;