import { createClient } from '@supabase/supabase-js';
import proj4 from 'proj4';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-key';

// Verificar se as variáveis de ambiente estão configuradas
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Definir o sistema de coordenadas português (igual ao visual.html)
proj4.defs(
  "ESRI:102164",
  "+proj=tmerc +lat_0=39.66666666666666 +lon_0=-8.131906111111112 +k=1 +x_0=200000 +y_0=300000 +ellps=intl +units=m +no_defs"
);

// Tipos para os dados das tabelas
export interface WellData {
  id: number;
  data: string;
  codigo: string;
  coord_x_m: number;
  coord_y_m: number;
  altitude_m?: string | number;
  sistema_aquifero?: string;
  estado?: string;
  freguesia?: string;
  created_at: string;
}

export interface ConductivityData extends WellData {
  condutividade: number;
  condcamp20c: number;
}

export interface NitrateData extends WellData {
  nitrato: string;
}

export interface PiezometricData extends WellData {
  nivel_piezometrico: string;
  profundidade_nivel_agua: string | number;
  profundidade_nivel_piezometrico: string;
}

export interface PrecipitationData extends WellData {
  precipitacao_dia_mm: number;
  nome: string;
}

// Interface para dados de temperatura (tabela model-meteo)
export interface TemperatureData {
  id: number;
  time: string;      // data/hora
  tx: number;        // temperatura máxima
  tn: number;        // temperatura mínima
  lat: number;
  long: number;
}

// ------------------- FUNÇÕES PARA TEMPERATURA -------------------

// Obtém as estações únicas (apenas coordenadas) usando a função RPC
export const fetchTemperatureStations = async (): Promise<{ lat: number; long: number; codigo: string }[]> => {
  if (!supabase) {
    console.warn('Supabase não configurado');
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('get_temperature_stations');
    if (error) {
      console.error('Erro ao buscar estações de temperatura:', error);
      return [];
    }
    return (data || []).map((item: any) => ({
      lat: item.lat,
      long: item.long,
      codigo: `${item.lat},${item.long}`,
    }));
  } catch (error) {
    console.error('Erro na função fetchTemperatureStations:', error);
    return [];
  }
};

// Busca o histórico completo de uma estação específica (com paginação)
export const fetchTemperatureHistory = async (lat: number, long: number): Promise<TemperatureData[]> => {
  if (!supabase) {
    console.warn('Supabase não configurado');
    return [];
  }

  const allData: TemperatureData[] = [];
  let page = 0;
  const pageSize = 1000;

  try {
    while (true) {
      const { data, error } = await supabase
        .from('model-meteo')
        .select('*')
        .eq('lat', lat)
        .eq('long', long)
        .order('time', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Erro ao buscar dados históricos de temperatura:', error);
        break;
      }
      if (!data || data.length === 0) break;

      allData.push(...data);
      if (data.length < pageSize) break;
      page++;
    }
    return allData;
  } catch (error) {
    console.error(`Erro ao buscar histórico da estação (${lat},${long}):`, error);
    return [];
  }
};

// ---------------------------------------------------------------------

// Função para converter coordenadas usando proj4js (igual ao visual.html)
export const utmToLatLng = (x: number, y: number): [number, number] => {
  try {
    const [lon, lat] = proj4("ESRI:102164", "WGS84", [x, y]);
    return [lat, lon];
  } catch (error) {
    console.error('Erro na conversão de coordenadas:', error);
    const lat = 39.5 + (y - 500000) / 1000000;
    const lng = -8.0 + (x - 500000) / 1000000;
    return [lat, lng];
  }
};

// Função específica para coordenadas de precipitação (UTM zona 29N)
export const precipToLatLng = (x: number, y: number): [number, number] => {
  try {
    const utmSystems = [
      "+proj=utm +zone=29 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
      "+proj=utm +zone=30 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
      "+proj=utm +zone=28 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
    ];
    
    for (const utmSystem of utmSystems) {
      try {
        const [lon, lat] = proj4(utmSystem, "WGS84", [x, y]);
        if (lat >= 36.5 && lat <= 42.5 && lon >= -10.0 && lon <= -6.0) {
          console.log(`✅ Sistema UTM correto encontrado para precipitação:`, utmSystem);
          return [lat, lon];
        }
      } catch (e) {
        continue;
      }
    }
    console.log(`⚠️ Usando UTM 29N como padrão para precipitação`);
    const [lon, lat] = proj4(utmSystems[0], "WGS84", [x, y]);
    return [lat, lon];
  } catch (error) {
    console.error('Erro na conversão de coordenadas de precipitação:', error);
    const lat = 39.5 + (y - 500000) / 1000000;
    const lng = -8.0 + (x - 500000) / 1000000;
    return [lat, lng];
  }
};

// Função para buscar dados por variável
export const fetchWellData = async (
  variable: string,
  sistemaAquifero?: string
): Promise<WellData[]> => {
  if (!supabase) {
    console.warn('Supabase não configurado. Configure as variáveis de ambiente REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY');
    return [];
  }

  let tableName: string;
  
  switch (variable) {
    case 'condutividade':
      tableName = 'condut_tejo_loc';
      break;
    case 'nitrato':
      tableName = 'nitrato_tejo_loc';
      break;
    case 'profundidade':
      tableName = 'piezo_tejo_loc';
      break;
    case 'precipitacao':
      tableName = 'precipitacao_tejo_loc';
      break;
    case 'caudal':
      tableName = 'caudal_tejo_loc';
      break;
    default:
      throw new Error(`Variável não suportada: ${variable}`);
  }
  
  console.log(`Iniciando query para tabela: ${tableName}`);
  
  try {
    let query = supabase.from(tableName).select('*');
    
    // Filtro especial para precipitação
    if (tableName === 'precipitacao_tejo_loc') {
      const codigosPrecipitacao = [
        '19E/01UG', '20E/02UG', '20D/01C', '18F/01UG',
        '20E/01C', '17G/02G', '17G/04UG'
      ];
      console.log(`🌧️ Aplicando filtro para precipitação - apenas 7 códigos específicos:`, codigosPrecipitacao);
      query = query.in('codigo', codigosPrecipitacao);
    }
    // Aplicar filtro de sistema aquífero se especificado (apenas para variáveis que têm esta coluna)
    else if (sistemaAquifero && sistemaAquifero !== 'todos' && tableName !== 'precipitacao_tejo_loc' && tableName !== 'caudal_tejo_loc') {
      console.log(`Aplicando filtro sistema_aquifero: ${sistemaAquifero} para variável: ${variable}`);
      query = query.eq('sistema_aquifero', sistemaAquifero);
    } else {
      console.log(`Não aplicando filtro sistema_aquifero. sistemaAquifero: ${sistemaAquifero}, variable: ${variable}`);
    }
    
    // Buscar todos os dados usando paginação
    let allData: WellData[] = [];
    let page = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data, error } = await query
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error('Erro ao buscar dados:', error);
        throw error;
      }
      if (!data || data.length === 0) break;
      
      // Debug específico para precipitação
      if (tableName === 'precipitacao_tejo_loc' && page === 0) {
        console.log(`🌧️ Estrutura dos dados de precipitação (primeiro registro):`, {
          colunas: Object.keys(data[0]),
          exemplo: data[0],
          total_registros: data.length
        });
      }
      
      allData = allData.concat(data);
      if (data.length < pageSize) break;
      page++;
    }
    
    console.log(`Query concluída. Total de registros: ${allData.length}`);
    
    if (tableName === 'precipitacao_tejo_loc') {
      console.log(`🌧️ Dados de precipitação carregados:`, {
        total: allData.length,
        codigos_unicos: Array.from(new Set(allData.map(d => d.codigo))),
      });
    }
    
    return allData;
    
  } catch (error) {
    console.error('Erro na função fetchWellData:', error);
    return [];
  }
};

// Função para verificar valores únicos na coluna sistema_aquifero (apenas para tabelas que a possuem)
export const checkSistemaAquiferoValues = async (variable: string): Promise<string[]> => {
  if (!supabase) {
    console.warn('Supabase não configurado');
    return [];
  }

  let tableName: string;
  switch (variable) {
    case 'condutividade':
      tableName = 'condut_tejo_loc';
      break;
    case 'nitrato':
      tableName = 'nitrato_tejo_loc';
      break;
    case 'profundidade':
      tableName = 'piezo_tejo_loc';
      break;
    default:
      return []; // caudal e outras variáveis não têm sistema aquífero
  }

  const allValues: string[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('sistema_aquifero')
      .not('sistema_aquifero', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Erro ao verificar valores sistema_aquifero:', error);
      return [];
    }

    if (!data || data.length === 0) break;

    const values = data.map(row => row.sistema_aquifero).filter(Boolean);
    allValues.push(...values);
    if (data.length < pageSize) break;
    page++;
  }

  const uniqueValues = Array.from(new Set(allValues)) as string[];
  console.log(`Valores únicos em sistema_aquifero para ${variable}:`, uniqueValues);
  return uniqueValues;
};

// Função para buscar dados históricos de um poço específico
export const fetchWellHistory = async (
  variable: string,
  codigo: string,
  sistemaAquifero?: string
): Promise<WellData[]> => {
  if (!supabase) {
    console.warn('Supabase não configurado. Configure as variáveis de ambiente REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY');
    return [];
  }

  let tableName: string;
  
  switch (variable) {
    case 'profundidade':
      tableName = 'piezo_tejo_loc';
      break;
    case 'condutividade':
      tableName = 'condut_tejo_loc';
      break;
    case 'nitrato':
      tableName = 'nitrato_tejo_loc';
      break;
    case 'precipitacao':
      tableName = 'precipitacao_tejo_loc';
      break;
    case 'caudal':
      tableName = 'caudal_tejo_loc';
      break;
    default:
      throw new Error(`Variável não suportada: ${variable}`);
  }
  
  console.log(`🔍 Buscando histórico para poço ${codigo} na tabela ${tableName}`);
  
  try {
    let query = supabase.from(tableName).select('*');
    
    // Para caudal, o identificador é 'localizacao', não 'codigo'
    if (variable === 'caudal') {
      query = query.eq('localizacao', codigo);
    } else {
      query = query.eq('codigo', codigo);
    }
    
    // Aplicar filtro de sistema aquífero se especificado (apenas para variáveis que têm esta coluna)
    if (sistemaAquifero && sistemaAquifero !== 'todos' && variable !== 'precipitacao' && variable !== 'caudal') {
      const sistemaMap: { [key: string]: string } = {
        'AL': 'T7-ALUVIÕES DO TEJO',
        'MD': 'T1-BACIA DO TEJO-SADO / MARGEM DIREITA',
        'ME': 'T3-BACIA DO TEJO-SADO / MARGEM ESQUERDA'
      };
      
      const sistemaReal = sistemaMap[sistemaAquifero];
      if (sistemaReal) {
        query = query.eq('sistema_aquifero', sistemaReal);
        console.log(`🔍 Aplicando filtro de sistema aquífero: ${sistemaReal}`);
      }
    }
    
    // Ordenar por data
    query = query.order('data', { ascending: true });
    
    // Buscar todos os dados históricos usando paginação
    let allData: WellData[] = [];
    let page = 0;
    const pageSize = 1000;
    
    console.log(`📊 Iniciando paginação com ${pageSize} registros por página`);
    
    while (true) {
      console.log(`📄 Buscando página ${page + 1}...`);
      
      const { data, error } = await query
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error('❌ Erro ao buscar histórico do poço:', error);
        throw error;
      }
      
      console.log(`📊 Página ${page + 1}: ${data?.length || 0} registros`);
      
      if (!data || data.length === 0) {
        console.log(`✅ Fim dos dados na página ${page + 1}`);
        break;
      }
      
      allData = allData.concat(data);
      console.log(`📈 Total acumulado: ${allData.length} registros`);
      
      if (data.length < pageSize) {
        console.log(`✅ Última página (${data.length} < ${pageSize})`);
        break;
      }
      
      page++;
    }
    
    console.log(`🎯 Histórico final para poço ${codigo}: ${allData.length} registros`);
    
    if (allData.length > 0) {
      console.log('📋 Primeiros 3 registros:', allData.slice(0, 3));
      console.log('📋 Últimos 3 registros:', allData.slice(-3));
    }
    
    return allData;
    
  } catch (error) {
    console.error('❌ Erro ao buscar histórico do poço:', error);
    return [];
  }
};