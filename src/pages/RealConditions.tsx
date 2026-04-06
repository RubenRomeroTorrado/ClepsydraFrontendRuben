import React, { useState } from 'react';
import irrocloudLogo from '../assets/images/irrocloud.png';
import myirrigationLogo from '../assets/images/myirrigation.png';
import image6 from '../assets/images/6.jpg';
import image7 from '../assets/images/7.jpg';
import image8 from '../assets/images/8.jpg';
import image2 from '../assets/images/2.JPG';
import image9 from '../assets/images/9.jpg';
import image10 from '../assets/images/10.jpg';
import image3 from '../assets/images/3.JPG';
import image12 from '../assets/images/12.jpg';
import image13 from '../assets/images/13.jpg';
import image14 from '../assets/images/14.jpg';
import image15 from '../assets/images/15.jpg';
import image16 from '../assets/images/16.jpg';

interface ImageData {
  src: string;
  alt: string;
  legend: string;
}

const RealConditions: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const images: ImageData[] = [
    {
      src: image6,
      alt: 'Campo de milho',
      legend: 'Campo de milho'
    },
    {
      src: image7,
      alt: 'Sonda diver',
      legend: 'Sonda diver instalada num furo para medição da profundidade da toalha freática'
    },
    {
      src: image8,
      alt: 'Recolha de dados',
      legend: 'Recolha de dados do diver para o computador'
    },
    {
      src: image2,
      alt: 'Tensiómetros',
      legend: 'Instalação de uma bateria de tensiómetros para medição do potencial de água no solo'
    },
    {
      src: image9,
      alt: 'Bateria de tensiómetros',
      legend: 'Bateria de tensiómetros a diferentes profundidades'
    },
    {
      src: image10,
      alt: 'Conexão à cloud',
      legend: 'Conexão à cloud'
    },
    {
      src: image3,
      alt: 'Leituras no smartphone',
      legend: 'Leituras do potencial de água no smartphone'
    },
    {
      src: image12,
      alt: 'Sonda FDR',
      legend: 'Instalação da sonda FDR de humidade do solo'
    },
    {
      src: image13,
      alt: 'Envio remoto',
      legend: 'Envio remoto de informação'
    },
    {
      src: image14,
      alt: 'Cápsulas para recolha',
      legend: 'Instalação das cápsulas para recolha da solução do solo e análise de nitratos'
    },
    {
      src: image15,
      alt: 'Cápsulas porosas',
      legend: 'Instalação das cápsulas porosas 2'
    },
    {
      src: image16,
      alt: 'Recolha da solução',
      legend: 'Recolha da solução do solo'
    }
  ];

  const handleImageHover = (event: React.MouseEvent, legend: string) => {
    setTooltipContent(legend);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
  };

  const handleImageLeave = () => {
    setShowTooltip(false);
  };

  const positionTooltip = (event: React.MouseEvent) => {
    const offset = 18;
    let left = event.clientX + offset;
    let top = event.clientY + offset;
    
    // Ajustar para não sair da janela
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    
    if (left + 200 > winWidth) { // 200px é uma estimativa da largura do tooltip
      left = winWidth - 210;
    }
    if (top + 50 > winHeight) { // 50px é uma estimativa da altura do tooltip
      top = winHeight - 60;
    }
    
    setTooltipPosition({ x: left, y: top });
  };

  const handleImageMove = (event: React.MouseEvent) => {
    positionTooltip(event);
  };

  return (
    <div className="flex-grow w-full py-12 pt-24">
      <div className="container mx-auto px-6 mt-6">
        {/* Texto introdutório */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-blue-900 mb-4">
            Observações em Condições Reais
          </h2>
          <p className="text-gray-700 text-base leading-relaxed">
            O local experimental português localiza-se na Quinta da Cholda, no Concelho da Golegã. 
            Aqui testam-se dois protocolos de monitorização: <strong>a)</strong> água subterrânea 
            (profundidade, concentração de nitratos e condutividade elétrica); <strong>b)</strong> zona 
            não saturada do solo (fluxos de água e de azoto)
          </p>
        </section>

        {/* Carrossel de imagens infinito */}
        <section className="mb-10">
          <div className="carousel-infinite">
            <div className="carousel-track">
              {/* Primeira sequência de imagens */}
              {images.map((image, index) => (
                <div key={`first-${index}`} className="relative group">
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    data-legend={image.legend} 
                    className={`carousel-img ${index === 11 ? 'img-16' : ''}`}
                    onMouseEnter={(e) => handleImageHover(e, image.legend)}
                    onMouseMove={handleImageMove}
                    onMouseLeave={handleImageLeave}
                  />
                </div>
              ))}
              
              {/* Duplicação das imagens para o efeito infinito */}
              {images.map((image, index) => (
                <div key={`second-${index}`} className="relative group">
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    data-legend={image.legend} 
                    className={`carousel-img ${index === 11 ? 'img-16' : ''}`}
                    onMouseEnter={(e) => handleImageHover(e, image.legend)}
                    onMouseMove={handleImageMove}
                    onMouseLeave={handleImageLeave}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Texto sobre ferramentas digitais */}
        <section className="mb-10">
          <p className="text-gray-700 text-base mb-6">
            A experimentação é suportada pelas plataformas Irrocloud e myIrrigation. 
            Estas permitem monitorizar remotamente a humidade do solo (teor de água e potencial de água).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <a href="https://www.irrocloud.com/irrocloud/login/?next=/" target="_blank" rel="noopener noreferrer">
                <img 
                  src={irrocloudLogo} 
                  alt="Irrocloud" 
                  className="rounded-lg shadow-md w-full max-w-xs mb-2 hover:scale-105 transition" 
                  loading="lazy"
                />
              </a>
              <span className="text-blue-800 font-semibold">Irrocloud</span>
            </div>
            <div className="flex flex-col items-center">
              <a href="https://myirrigation.eu/login" target="_blank" rel="noopener noreferrer">
                <img 
                  src={myirrigationLogo} 
                  alt="myIrrigation" 
                  className="rounded-lg shadow-md w-full max-w-xs mb-2 hover:scale-105 transition" 
                  loading="lazy"
                />
              </a>
              <span className="text-blue-800 font-semibold">MyIrrigation</span>
            </div>
          </div>
        </section>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="carousel-tooltip visible"
          style={{
            left: tooltipPosition.x + 'px',
            top: tooltipPosition.y + 'px'
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};

export default RealConditions; 