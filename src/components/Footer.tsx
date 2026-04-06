import React from 'react';
import logoFooter from '../assets/images/logo_footer_c.png';

const Footer: React.FC = () => {
  return (
    <>
      {/* Friso colorido */}
      <div 
        className="w-full h-8" 
        style={{ 
          background: 'linear-gradient(to right, #17479e, #0e6bb5, #0093d3, #5a5a8c, #c1272d, #ff6f1f, #d6b08c, #a3bfa8, #4a2c0a)' 
        }}
      />
      
      {/* Footer com logo dos parceiros */}
      <footer className="bg-white py-4 px-6 shadow">
        <div className="container mx-auto flex justify-center items-center min-h-[80px]">
          <img 
            src={logoFooter} 
            alt="Logos dos parceiros do projeto Clepsydra" 
            className="w-auto h-12 max-w-full object-contain" 
            loading="eager"
          />
        </div>
      </footer>
    </>
  );
};

export default Footer; 