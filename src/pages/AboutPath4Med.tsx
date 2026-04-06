import React from 'react';

const AboutPath4Med: React.FC = () => {
  return (
    <div className="pt-20 pb-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-clepsydra-blue mb-6">
            Sobre o Projeto Path4Med
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              O projeto Path4Med é uma iniciativa dedicada ao desenvolvimento de 
              soluções médicas inovadoras e tecnologias de saúde avançadas.
            </p>
            
            <h2 className="text-2xl font-semibold text-clepsydra-blue mb-4">
              Objetivos
            </h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Desenvolver tecnologias médicas inovadoras</li>
              <li>Melhorar a qualidade dos cuidados de saúde</li>
              <li>Promover a colaboração entre instituições médicas</li>
              <li>Facilitar o acesso a tecnologias médicas avançadas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPath4Med; 