import React from 'react';
import europaClep from '../assets/images/europa_clep.png';

const Tasks: React.FC = () => {
  return (
    <div className="flex-grow w-full py-12 pt-24" style={{ backgroundColor: '#174192' }}>
      <div className="relative w-full flex-grow min-h-[60vh] flex items-center justify-start mt-6" style={{ minHeight: '600px' }}>
        {/* Mapa como background decorativo, ocupa parte da área principal */}
        <div className="absolute right-0 top-0 h-[65vh] w-[900px] max-w-[60vw] pointer-events-none select-none z-0 overflow-hidden flex items-center justify-end">
          <img 
            src={europaClep} 
            alt="Europa Clepsydra" 
            className="h-full w-auto object-contain object-right" 
            loading="eager"
          />
        </div>
        
        {/* Boxes das tarefas em grid quadrado */}
        <div className="relative z-10 flex flex-1 items-center justify-start pl-4 md:pl-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="bg-white bg-opacity-95 rounded-xl p-6 flex flex-col justify-center gap-2 border border-gray-100 items-start w-full max-w-[600px] h-[220px] transition-all duration-200 cursor-pointer hover:opacity-80">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-base">1</div>
                <span className="text-blue-900 text-base font-semibold">Tarefa 1</span>
              </div>
              <span className="text-gray-700 text-sm font-normal leading-relaxed">
                Desenvolvimento de ferramentas para <span className="text-blue-700 font-medium">monitorização e obtenção dados</span> e <span className="text-blue-700 font-medium">identificação de lacunas</span>.
              </span>
            </div>
            
            <div className="bg-white bg-opacity-95 rounded-xl p-6 flex flex-col justify-center gap-2 border border-gray-100 items-start w-full max-w-[600px] h-[220px] transition-all duration-200 cursor-pointer hover:opacity-80">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-base">2</div>
                <span className="text-blue-900 text-base font-semibold">Tarefa 2</span>
              </div>
              <span className="text-gray-700 text-sm font-normal leading-relaxed">
                Criação ou <span className="text-blue-700 font-medium">melhoria/atualização</span> de rede de monitorização <span className="italic">(geração de dados)</span>
              </span>
            </div>
            
            <div className="bg-white bg-opacity-95 rounded-xl p-6 flex flex-col justify-center gap-2 border border-gray-100 items-start w-full max-w-[600px] h-[220px] transition-all duration-200 cursor-pointer hover:opacity-80">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-base">3</div>
                <span className="text-blue-900 text-base font-semibold">Tarefa 3</span>
              </div>
              <span className="text-gray-700 text-sm font-normal leading-relaxed">
                <span className="text-blue-700 font-medium">Observações em condições reais</span> – Living Lab
              </span>
            </div>
            
            <div className="bg-white bg-opacity-95 rounded-xl p-6 flex flex-col justify-center gap-2 border border-gray-100 items-start w-full max-w-[600px] h-[220px] transition-all duration-200 cursor-pointer hover:opacity-80">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-base">4</div>
                <span className="text-blue-900 text-base font-semibold">Tarefa 4</span>
              </div>
              <span className="text-gray-700 text-sm font-normal leading-relaxed">
                Capacitação e sensibilização social
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks; 