import React from 'react';
import { FileText, Folder } from 'lucide-react';
import dbPoster from '../assets/images/db_poster_rm.png';

const DataBibliography: React.FC = () => {
  const downloads = [
    {
      title: 'Precipitação (CSV)',
      url: 'https://drive.google.com/file/d/1JHshXWcRano7IFRn9zK0U-TZW5O4Z6YS/view?usp=sharing'
    },
    {
      title: 'Concentração de Nitratos (CSV)',
      url: 'https://drive.google.com/file/d/1TvsLe6_yz6PUkLbGkKCeNI64n-k4pmYw/view?usp=sharing'
    },
    {
      title: 'Condutividade Elétrica (CSV)',
      url: 'https://drive.google.com/file/d/1RiQHOOydlDOzvBnpGKzcT6p6Z0oOWv3M/view?usp=sharing'
    },
    {
      title: 'Piezometria (CSV)',
      url: 'https://drive.google.com/file/d/1IMczBMfrlOhqPsJrYshbijUGgkuFLsPK/view?usp=sharing'
    },
    {
      title: 'Consumo de Rega Estimados (CSV)',
      url: 'https://drive.google.com/file/d/12hmOJ59t2uQP7L5P-0-ZJKci8LKGVJ8R/view?usp=sharing'
    },
    {
      title: 'Temperaturas Máximas e Mínimas (CSV)',
      url: 'https://drive.google.com/file/d/1C8OjPBl1EO1Q4ssBE1_t7kFKnnWwAYr6/view?usp=sharing'
    }
  ];

  const metadataTable = [
    {
      variavel: 'Precipitação',
      fonte: 'SNIRH',
      tipo: 'Observados',
      intervalo: '1979-10-01 a 2025-03-15',
      frequencia: 'Diário',
      observacoes: '70',
      unidades: 'mm',
      zona: 'ZVT e área envolvente'
    },
    {
      variavel: 'Piezometria',
      fonte: 'SNIRH',
      tipo: 'Observados',
      intervalo: '1974-10-01 a 2025-01-16',
      frequencia: 'Mensal',
      observacoes: '73',
      unidades: 'm',
      zona: 'Aquíferos ZVT'
    },
    {
      variavel: 'Nitratos',
      fonte: 'SNIRH',
      tipo: 'Observados',
      intervalo: '2000-03-01 a 2023-10-25',
      frequencia: 'Semanal',
      observacoes: '112',
      unidades: 'mg/L',
      zona: 'Aquíferos ZVT'
    },
    {
      variavel: 'Condutividade Elétrica',
      fonte: 'SNIRH',
      tipo: 'Observados',
      intervalo: '2000-03-01 a 2023-10-25',
      frequencia: 'Semanal',
      observacoes: '103',
      unidades: 'µS/cm',
      zona: 'Aquíferos ZVT'
    },
    {
      variavel: 'Consumo de Rega Estimados',
      fonte: 'Clepsydra/ISA',
      tipo: 'Modelados',
      intervalo: '1989, 1999, 2009, 2019',
      frequencia: 'Anual',
      observacoes: '20',
      unidades: 'hm³',
      zona: 'Aquíferos ZVT'
    },
    {
      variavel: 'Temperatura Máx e Min',
      fonte: 'E-OBS',
      tipo: 'Modelados',
      intervalo: '2014 - 2024',
      frequencia: 'Diário',
      observacoes: '145',
      unidades: 'ºC',
      zona: 'ZVT e área envolvente'
    }
  ];

  return (
    <div className="flex flex-col flex-grow container mx-auto px-6 py-12 pt-24">
      <section className="mb-12 mt-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Informação dos Dados
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Na presente tarefa do projeto Clepsydra, pretende desenvolver-se uma base de dados que centralize informação atualmente dispersa e a disponibilize de forma estruturada e orientada para a aplicação prática, relevante para o estudo da água subterrânea na Zona Vulnerável do Tejo, em contexto agrícola. As séries históricas de dados recolhidas foram analisadas quanto à sua qualidade e consistência, tendo sido posteriormente organizadas na base de dados. Parte da informação já se encontra disponível em plataformas existentes, como o SNIRH, enquanto outra foi estimada no âmbito do projeto. Esta base de dados será disponibilizada aos stakeholders e à comunidade científica, com o objetivo de apoiar os estudos a desenvolver na Zona Vulnerável do Tejo.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Caixa de Downloads */}
          <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              <Folder className="mr-2 text-blue-600 inline" size={20} />
              Download de Dados
            </h3>
            <ul className="list-disc pl-5 text-gray-600">
              {downloads.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.url}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tabela de Metadados */}
          <div className="overflow-x-auto flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              <FileText className="mr-2 text-blue-600 inline" size={20} />
              Metadados das variáveis de estudo
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-gray-600 border-collapse text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Variável
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Fonte
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Tipo de dados
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Intervalo Temporal
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Frequência de Registo
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Observações
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Unidades
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Zona
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metadataTable.map((row, index) => (
                    <tr key={index} className="bg-white">
                      <td className="border border-gray-300 px-4 py-2">
                        {row.variavel}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{row.fonte}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.tipo}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {row.intervalo}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{row.frequencia}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.observacoes}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.unidades}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {row.zona}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2: Centralização dos Dados numa Base de Dados */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Centralização dos Dados, BD PostgreSQL
        </h2>
        <div className="flex flex-col">
          <div className="mb-4">
            <p className="text-gray-600 leading-relaxed">
              O projeto Clepsydra adotou a metodologia CRISP-DM para estruturar o pipeline de dados, com foco na fase de Preparação de Dados para consolidar, limpar e organizar dados históricos. Centralizámos os conjuntos de dados numa base de dados relacional usando DBeaver e PostgreSQL. Esta base de dados inclui tabelas de metadados: <code>info_qualidade</code>, <code>info_piezo</code>, <code>info_meteorologia</code>, e tabelas de valores: <code>condut_tejo_loc</code>, <code>nitrato_tejo_loc</code> e <code>precipitacao_tejo_loc</code>, que armazenam dados sobre qualidade da água, condições meteorológicas e características dos aquíferos. Esta estrutura garante a qualidade dos dados e suporta a modelação preditiva dos níveis freáticos na ZV Tejo.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full md:w-1/2">
              <img
                src={dbPoster}
                alt="Esquema da Base de Dados DBeaver"
                className="w-full h-auto"
                style={{ maxHeight: 'none' }}
                loading="lazy"
              />
              <p className="text-gray-500 text-sm mt-1">
                <strong> Fig 1.</strong> Screenshot do esquema da base de dados Clepsydra no DBeaver, mostrando a estrutura relacional dos dados de qualidade da água, meteorologia e aquíferos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataBibliography; 