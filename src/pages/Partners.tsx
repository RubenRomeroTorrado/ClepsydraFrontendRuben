import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import apaLogo from '../assets/images/apa_lg.png';
import arLogo from '../assets/images/ar_lg.png';
import choldaLogo from '../assets/images/quintacholda_lg.png';
import fenaregLogo from '../assets/images/fenareg_lg.png';
import arbvsLogo from '../assets/images/arbvs_lg.jpg';
import aquagriLogo from '../assets/images/aquagri_lg.png';
import lusofonaLogo from '../assets/images/lusofona_lg.png';

interface Partner {
  id: string;
  name: string;
  description: string;
  logo: string;
  logoHeight: string;
  website?: string;
}

const Partners: React.FC = () => {
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const partners: Partner[] = [
    {
      id: 'apa',
      name: 'APA',
      description: 'A Agência Portuguesa do Ambiente (APA) é a entidade nacional responsável pela implementação das políticas de ambiente e desenvolvimento sustentável em Portugal, com especial enfoque na gestão integrada dos recursos hídricos, proteção do ambiente, prevenção e controlo da poluição, adaptação às alterações climáticas e promoção da sustentabilidade ambiental. Atua como autoridade nacional da água, coordenando a gestão das bacias hidrográficas e promovendo a participação pública na defesa do ambiente.',
      logo: apaLogo,
      logoHeight: 'h-20'
    },
    {
      id: 'ar',
      name: 'AR',
      description: 'Águas do Ribatejo (AR) é uma empresa intermunicipal responsável pelo abastecimento de água e saneamento em sete concelhos do Ribatejo. Destaca-se pela gestão integrada do ciclo urbano da água, pela promoção da inclusão social e ambiental, e pela implementação de projetos inovadores de sustentabilidade, qualidade da água e educação ambiental. É reconhecida como caso de estudo internacional pelo seu modelo de gestão eficiente e sustentável.',
      logo: arLogo,
      logoHeight: 'h-16'
    },
    {
      id: 'cholda',
      name: 'Quinta da Cholda',
      description: 'A Quinta da Cholda é uma exploração agrícola localizada em Azinhaga, Ribatejo, dedicada à produção agrícola sustentável e à inovação no setor agroalimentar. Com uma forte ligação ao território e à tradição agrícola da região, aposta em práticas de produção responsáveis, valorizando a qualidade dos produtos e a preservação ambiental.',
      logo: choldaLogo,
      logoHeight: 'h-28'
    },
    {
      id: 'fnareg',
      name: 'FNAREG',
      description: 'A Federação Nacional de Regantes de Portugal (FENAREG) representa as associações de regantes a nível nacional, promovendo a defesa, valorização e modernização do regadio em Portugal. Atua na articulação com entidades públicas e privadas, desenvolve projetos de inovação, sustentabilidade e eficiência hídrica, e defende políticas que assegurem a viabilidade e competitividade da agricultura de regadio.',
      logo: fenaregLogo,
      logoHeight: 'h-20'
    },
    {
      id: 'arbvs',
      name: 'ARBVS',
      description: 'A Associação de Regantes e Beneficiários do Vale do Sorraia (ARBVS) gere, desde 1959, a administração, conservação e exploração do Aproveitamento Hidroagrícola do Vale do Sorraia. É responsável pela gestão eficiente da água para rega, modernização das infraestruturas, apoio técnico aos agricultores e implementação de projetos de inovação e sustentabilidade agrícola na região do Ribatejo.',
      logo: arbvsLogo,
      logoHeight: 'h-20'
    },
    {
      id: 'aquagri',
      name: 'AQUAGRI',
      description: 'A AQUAGRI é uma empresa especializada em serviços e equipamentos para a gestão eficiente da água de rega, integrando tecnologias de monitorização, sensores e plataformas digitais. Desde 1998, apoia agricultores na otimização da rega, promovendo a sustentabilidade, inovação tecnológica e uso racional dos recursos hídricos, com soluções adaptadas à agricultura moderna.',
      logo: aquagriLogo,
      logoHeight: 'h-16'
    },
    {
      id: 'lusofona',
      name: 'Universidade Lusófona',
      description: 'A Universidade Lusófona é a maior universidade privada de Portugal, dedicada ao ensino, investigação e inovação em diversas áreas do conhecimento. Tem como missão contribuir para o desenvolvimento científico, cultural, económico e social de Portugal e dos países lusófonos, promovendo a internacionalização, a inclusão e a ligação entre ciência, sociedade e empresas.',
      logo: lusofonaLogo,
      logoHeight: 'h-20'
    }
  ];

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="flex-grow w-full py-12 pt-24">
      <div className="container mx-auto px-6 mt-6">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-12 tracking-wide uppercase">
          Parceiros Associados
        </h2>
        
        {partners.map((partner) => (
          <div key={partner.id} className="mb-12">
            <div className="partner-title-row mb-0">
              <div className="partner-divider"></div>
              <span 
                className="partner-title-bar accordion-toggle" 
                onClick={() => toggleAccordion(partner.id)}
              >
                <ChevronRight 
                  className={`accordion-arrow ${openAccordions.includes(partner.id) ? 'open' : ''}`}
                  size={16}
                />
                {partner.name}
              </span>
              <div className="partner-divider"></div>
            </div>
            
            <div className={`accordion-content ${openAccordions.includes(partner.id) ? 'open' : ''}`}>
              {partner.description}
            </div>
            
            <div className="flex flex-wrap justify-center gap-12">
              <button 
                type="button"
                onClick={() => window.open(partner.website || '#', '_blank')}
                className="cursor-pointer"
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className={`${partner.logoHeight} object-contain`} 
                  loading="eager"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Partners; 