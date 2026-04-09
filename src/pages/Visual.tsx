import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import Papa from 'papaparse';
import proj4 from 'proj4';
import { fetchWellData, fetchWellHistory, fetchTemperatureStations, fetchTemperatureHistory, utmToLatLng, WellData, checkSistemaAquiferoValues } from '../utils/supabase';
import { computeTrend, TrendComputation } from '../utils/trend';

// Registrar o plugin de zoom
Chart.register(zoomPlugin);

// Constante para conversão de ms para ano
const MS_PER_YEAR = 1000 * 3600 * 24 * 365.25;

interface WellDataWithChart extends WellData {
  coord?: [number, number];
  chartData?: Array<{
    date: string;
    value?: number | null;        // opcional para temperatura
    tx?: number | null;           // para temperatura (máx)
    tn?: number | null;           // para temperatura (mín)
  }>;
  nome?: string;
}

interface SampleDataType {
  [key: string]: {
    [codigo: string]: WellDataWithChart;
  };
}

// Interface para os dados da tabela Info (cada poço)
interface InfoTableData {
  [codigo: string]: {
    periodo: string;
    tendencia: string;
  };
}

// Interface para a tabela resumo (contagem por tendência)
interface SummaryData {
  aumento: number;
  diminuicao: number;
  semTendencia: number;
}

const Visual: React.FC = () => {
  const [selectedVariable, setSelectedVariable] = useState('profundidade');
  const [selectedPoint, setSelectedPoint] = useState('');
  const [selectedSistemaAquifero, setSelectedSistemaAquifero] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false);
  const [currentChart, setCurrentChart] = useState<Chart | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoTableData, setInfoTableData] = useState<InfoTableData | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wellData, setWellData] = useState<SampleDataType>({});
  const [sistemaAquiferoOptions, setSistemaAquiferoOptions] = useState<string[]>([]);
  const [lastSortedData, setLastSortedData] = useState<Array<{x: number, y: number}>>([]);
  const [trendResult, setTrendResult] = useState<TrendComputation | null>(null);
  
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);

  const variables = [
    { value: 'profundidade', label: 'Profundidade aquífero', icon: 'fa-tint', color: 'blue' },
    { value: 'nitrato', label: 'Nitratos aquífero', icon: 'fa-flask', color: 'green' },
    { value: 'condutividade', label: 'Condutividade aquífero', icon: 'fa-bolt', color: 'yellow' },
    { value: 'precipitacao', label: 'Precipitação', icon: 'fa-cloud-rain', color: 'purple' },
    { value: 'rega', label: 'Rega', icon: 'fa-tint', color: 'blue' },
    { value: 'temperaturas', label: 'Temperaturas', icon: 'fa-thermometer-half', color: 'red' },
    { value: 'caudal', label: 'Caudal', icon: 'fa-water', color: 'blue' }
  ];

  // Variáveis que devem ser exibidas como gráfico de linhas
  const lineVariables = ['precipitacao', 'profundidade', 'temperaturas', 'caudal'];

  // Variáveis que suportam análise de tendência
  const trendVariables = ['profundidade', 'nitrato'];

  // Textos específicos para a direção da tendência
  const trendDirectionText: Record<string, { aumento: string; diminuicao: string }> = {
    profundidade: { aumento: 'Aumento da profundidade', diminuicao: 'Diminuição da profundidade' },
    nitrato: { aumento: 'Aumento da concentração', diminuicao: 'Diminuição da concentração' },
    caudal: { aumento: 'Aumento do caudal', diminuicao: 'Diminuição do caudal' }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).L) {
      initMap();
    }
  }, []);

  useEffect(() => {
    loadWellData();
    loadSistemaAquiferoOptions();
  }, [selectedVariable]);

  useEffect(() => {
    if (selectedVariable !== 'precipitacao') {
      loadWellData();
    }
    setSelectedPoint('');
  }, [selectedSistemaAquifero, selectedVariable]);

  useEffect(() => {
    if (mapRef.current && Object.keys(wellData).length > 0) {
      updateMap();
      updateWellFilter();
    }
  }, [wellData, selectedVariable]);

  const loadWellData = async () => {
    setLoading(true);
    try {
      let data: WellData[] = [];
      
      if (selectedVariable === 'precipitacao') {
        data = await loadPrecipitacaoFromCSV();
      } else if (selectedVariable === 'temperaturas') {
        const stations = await fetchTemperatureStations();
        data = stations.map((station, idx) => ({
          id: idx,
          codigo: station.codigo,
          coord_x_m: station.lat,
          coord_y_m: station.long,
          data: '',
          created_at: new Date().toISOString(),
          chartData: [],
        } as any));
      } else {
        data = await fetchWellData(selectedVariable, selectedSistemaAquifero);
      }
      
      const processedData: SampleDataType = {};
      
      data.forEach((well) => {
        let codigo: string | undefined;
        if (selectedVariable === 'caudal') {
          codigo = (well as any).localizacao;
          if (!codigo) {
            console.warn('Registo de caudal sem localizacao, ignorado.');
            return;
          }
        } else {
          codigo = well.codigo;
          if (!codigo) return;
        }
        
        if (!isValidCoordinate(well.coord_x_m) || !isValidCoordinate(well.coord_y_m)) {
          return;
        }
        
        const [lat, lng] = selectedVariable === 'temperaturas'
          ? [well.coord_x_m, well.coord_y_m]
          : (selectedVariable === 'precipitacao'
            ? convertPrecipitacaoCoords(well.coord_x_m, well.coord_y_m)
            : utmToLatLng(well.coord_x_m, well.coord_y_m));
        
        const value = getValueFromWell(well, selectedVariable);
        if (selectedVariable !== 'temperaturas' && value === null) {
          return;
        }
        
        if (!processedData[selectedVariable]) {
          processedData[selectedVariable] = {};
        }
        
        if (!processedData[selectedVariable][codigo]) {
          processedData[selectedVariable][codigo] = {
            ...well,
            coord: [lat, lng],
            chartData: selectedVariable === 'temperaturas'
              ? (well as any).chartData
              : [{ date: well.data, value: value }]
          };
        }
      });
      
      console.log(`Total de pontos no mapa para ${selectedVariable}:`, 
        processedData[selectedVariable] ? Object.keys(processedData[selectedVariable]).length : 0);
      
      setWellData(processedData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setWellData({});
    } finally {
      setLoading(false);
    }
  };

  const convertPrecipitacaoCoords = (x: number, y: number): [number, number] => {
    try {
      proj4.defs(
        "ESRI:102164",
        "+proj=tmerc +lat_0=39.66666666666666 +lon_0=-8.131906111111112 +k=1 +x_0=200000 +y_0=300000 +ellps=intl +units=m +no_defs"
      );
      const fromProj = "ESRI:102164";
      const toProj = "WGS84";
      
      const [lon, lat] = proj4(fromProj, toProj, [x, y]);
      return [lat, lon];
    } catch (error) {
      console.error('Erro na conversão de coordenadas de precipitação:', error);
      return [39.5, -8.0];
    }
  };

  const loadPrecipitacaoFromCSV = (): Promise<WellData[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse('https://raw.githubusercontent.com/clepsydraisa/clepsydra_frontend/main/data/prec_model_al.csv', {
        download: true,
        header: true,
        complete: function (results) {
          const stations: { [key: string]: any } = {};
          
          results.data.forEach((row: any) => {
            if (!row.codigo) return;
            
            if (!stations[row.codigo]) {
              stations[row.codigo] = {
                nome: row.nome,
                coord_x_m: parseFloat(row.coord_x_m || '0'),
                coord_y_m: parseFloat(row.coord_y_m || '0'),
                data: [],
              };
            }
            
            const dateStr = row.data ? row.data.substring(0, 10) : "";
            const precipitacao = parseFloat(row.precipitacao_dia_mm) || 0;
            
            stations[row.codigo].data.push({
              date: dateStr,
              precipitacao: precipitacao,
            });
          });
          
          Object.values(stations).forEach((station) => {
            station.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          });
          
          const data: WellData[] = [];
          Object.entries(stations).forEach(([codigo, station], index) => {
            const firstData = station.data[0];
            
            data.push({
              id: index,
              codigo: codigo,
              coord_x_m: station.coord_x_m,
              coord_y_m: station.coord_y_m,
              data: firstData?.date || '',
              precipitacao_dia_mm: firstData?.precipitacao || 0,
              nome: station.nome,
              created_at: new Date().toISOString()
            } as any);
          });
          
          resolve(data);
        },
        error: function (error) {
          console.error('Erro ao carregar CSV de precipitação:', error);
          reject(error);
        }
      });
    });
  };

  const loadPrecipitacaoHistoricalData = (codigo: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse('https://raw.githubusercontent.com/clepsydraisa/clepsydra_frontend/main/data/prec_model_al.csv', {
        download: true,
        header: true,
        complete: function (results) {
          const historicalData: any[] = [];
          
          results.data.forEach((row: any) => {
            if (row.codigo === codigo && row.data && row.precipitacao_dia_mm) {
              historicalData.push({
                codigo: row.codigo,
                data: row.data.substring(0, 10),
                precipitacao_dia_mm: parseFloat(row.precipitacao_dia_mm) || 0,
                nome: row.nome,
                coord_x_m: parseFloat(row.coord_x_m || '0'),
                coord_y_m: parseFloat(row.coord_y_m || '0')
              });
            }
          });
          
          historicalData.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
          
          resolve(historicalData);
        },
        error: function (error) {
          console.error('Erro ao carregar dados históricos de precipitação:', error);
          reject(error);
        }
      });
    });
  };

  const loadSistemaAquiferoOptions = async () => {
    try {
      if (selectedVariable === 'precipitacao' || selectedVariable === 'temperaturas' || selectedVariable === 'caudal') {
        setSistemaAquiferoOptions([]);
        return;
      }
      
      const options = await checkSistemaAquiferoValues(selectedVariable);
      setSistemaAquiferoOptions(options);
    } catch (error) {
      console.error('Erro ao carregar sistemas aquíferos:', error);
      setSistemaAquiferoOptions([]);
    }
  };

  const cleanNumber = (value: string | number | null | undefined): number | null => {
    if (value === null || value === undefined) return null;
    
    if (typeof value === 'string') {
      const cleaned = value.replace(/[<>()]/g, '').trim();
      if (cleaned === '') return null;
      
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }
    
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }
    
    return null;
  };

  const isValidCoordinate = (coord: number | null | undefined): boolean => {
    return coord !== null && coord !== undefined && !isNaN(coord) && coord !== 0;
  };

  const getValueFromWell = (well: WellData, variable: string): number | null => {
    switch (variable) {
      case 'condutividade':
        return cleanNumber((well as any).condutividade);
      case 'nitrato':
        return cleanNumber((well as any).nitrato);
      case 'profundidade':
        return cleanNumber((well as any).profundidade_nivel_agua);
      case 'precipitacao':
        return cleanNumber((well as any).precipitacao_dia_mm);
      case 'caudal':
        return cleanNumber((well as any)['caudal_médio_diário(m3/s)']);
      default:
        return null;
    }
  };

  const initMap = () => {
    if (mapRef.current) return;
    
    const L = (window as any).L;
    mapRef.current = L.map('map').setView([39.5, -8], 8);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);
    
    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
  };

  const clearMarkers = () => {
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
  };

  const getVariableConfig = (variable: string) => {
    return variables.find(v => v.value === variable) || variables[0];
  };

  const updateMap = () => {
    clearMarkers();
    const data = wellData[selectedVariable];
    if (!data) return;

    const L = (window as any).L;
    const variableConfig = getVariableConfig(selectedVariable);
    
    Object.entries(data).forEach(([codigo, well]) => {
      const marker = L.marker(well.coord, {
        icon: L.AwesomeMarkers.icon({
          icon: variableConfig.icon,
          markerColor: variableConfig.color,
          prefix: 'fa'
        })
      });
      
      marker.addTo(markersLayerRef.current).on('click', () => {
        openChartModal(codigo, well);
      });
    });
  };

  const updateWellFilter = () => {
    const data = wellData[selectedVariable];
    if (!data) return;
  };

  const focusOnWell = (codigo: string) => {
    const data = wellData[selectedVariable];
    if (!data || !data[codigo] || !mapRef.current) return;
    
    const well = data[codigo];
    mapRef.current.setView(well.coord, 14);
    openChartModal(codigo, well);
  };

  const openChartModal = async (codigo: string, well: WellDataWithChart) => {
    const title = selectedVariable === 'precipitacao' 
      ? `Estação ${codigo} - ${well.nome || ''}`
      : (selectedVariable === 'temperaturas'
        ? `Estação Meteorológica ${codigo}`
        : `Poço ${codigo}`);
    setModalTitle(title);
    setShowModal(true);
    
    try {
      let historicalData: any[] = [];
      
      if (selectedVariable === 'precipitacao') {
        historicalData = await loadPrecipitacaoHistoricalData(codigo);
      } else if (selectedVariable === 'temperaturas') {
        const [latStr, longStr] = codigo.split(',');
        const lat = parseFloat(latStr);
        const long = parseFloat(longStr);
        const tempHistory = await fetchTemperatureHistory(lat, long);
        const chartData = tempHistory.map(record => ({
          date: record.time,
          tx: record.tx,
          tn: record.tn,
        }));
        const updatedWell = { ...well, chartData };
        setTimeout(() => {
          if (chartRef.current) createChart(codigo, updatedWell);
        }, 100);
        return;
      } else {
        const idParaHistorico = codigo;
        historicalData = await fetchWellHistory(selectedVariable, idParaHistorico, 'todos');
      }
      
      const chartData = historicalData
        .map((record) => {
          const value = getValueFromWell(record, selectedVariable);
          if (value === null) return null;
          return {
            date: record.data,
            value: value
          };
        })
        .filter(item => item !== null);
      
      const updatedWell = {
        ...well,
        chartData: chartData as Array<{ date: string; value: number | null }>
      };
      
      setTimeout(() => {
        if (chartRef.current) {
          createChart(codigo, updatedWell);
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setTimeout(() => {
        if (chartRef.current) {
          createChart(codigo, well);
        }
      }, 100);
    }
  };

  const createChart = (codigo: string, well: WellDataWithChart) => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (currentChart) {
      currentChart.destroy();
    }

    const variableConfig = getVariableConfig(selectedVariable);
    const chartData = well.chartData || [];

    const sortedData = chartData
      .slice()
      .filter(d => d.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const isLineType = lineVariables.includes(selectedVariable);

    const datasets: any[] = [];

    if (selectedVariable === 'temperaturas') {
      datasets.push({
        label: 'Temperatura Máxima (°C)',
        data: sortedData.map(d => ({ x: d.date, y: d.tx })),
        borderColor: 'rgba(255, 0, 0, 0.8)',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        fill: false,
        tension: 0.2,
        showLine: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      });
      datasets.push({
        label: 'Temperatura Mínima (°C)',
        data: sortedData.map(d => ({ x: d.date, y: d.tn })),
        borderColor: 'rgba(0, 0, 255, 0.8)',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        fill: false,
        tension: 0.2,
        showLine: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      });
    } else {
      datasets.push({
        label: selectedVariable === 'profundidade' ? 'Profundidade Nível Água (m)' : `${variableConfig.label} (${getUnit(selectedVariable)})`,
        data: sortedData.map(d => ({ x: d.date, y: d.value })),
        borderColor: selectedVariable === 'precipitacao' ? '#800080' : (selectedVariable === 'profundidade' ? '#007bff' : variableConfig.color),
        backgroundColor: selectedVariable === 'precipitacao' ? 'rgba(128,0,128,0.2)' : (selectedVariable === 'profundidade' ? 'rgba(0,123,255,0.2)' : variableConfig.color),
        fill: selectedVariable === 'precipitacao' || selectedVariable === 'profundidade' ? 'start' : false,
        tension: 0.2,
        showLine: isLineType,
        pointRadius: isLineType ? 3 : 4,
        pointHoverRadius: 6,
      });
    }

    const newChart = new Chart(ctx, {
      type: (selectedVariable === 'temperaturas' || isLineType) ? 'line' : 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'year',
              tooltipFormat: 'yyyy-MM-dd',
              displayFormats: {
                year: 'yyyy',
                month: 'yyyy-MM',
                day: 'yyyy-MM-dd'
              }
            },
            title: { display: true, text: 'Data' },
            ticks: { maxTicksLimit: 10 }
          },
          y: {
            title: {
              display: true,
              text: selectedVariable === 'temperaturas' ? 'Temperatura (°C)' : (selectedVariable === 'profundidade' ? 'Profundidade (m)' : `${variableConfig.label} (${getUnit(selectedVariable)})`)
            },
            reverse: selectedVariable === 'profundidade',
            min: selectedVariable === 'temperaturas' ? -5 : 0,
            ticks: { callback: (value) => value }
          }
        },
        plugins: {
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: { mode: 'x', drag: { enabled: true }, wheel: { enabled: true } }
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const date = new Date(context[0]?.parsed.x || 0);
                return date.toLocaleDateString('pt-BR');
              },
              label: (context) => {
                const label = context.dataset.label;
                const value = context.parsed.y;
                return `${label}: ${value} ${selectedVariable === 'temperaturas' ? '°C' : getUnit(selectedVariable)}`;
              }
            }
          }
        }
      }
    });

    if (selectedVariable !== 'temperaturas') {
      const numericData = sortedData
        .map(d => ({ x: new Date(d.date).getTime(), y: d.value }))
        .filter((d): d is { x: number; y: number } => 
          d.y !== null && d.y !== undefined && !isNaN(d.x) && !isNaN(d.y)
        );
      setLastSortedData(numericData);
    } else {
      setLastSortedData([]);
    }

    setCurrentChart(newChart as any);
  };

  const getUnit = (variable: string): string => {
    switch (variable) {
      case 'profundidade': return 'm';
      case 'nitrato': return 'mg/L';
      case 'condutividade': return 'µS/cm';
      case 'precipitacao': return 'mm';
      case 'temperaturas': return '°C';
      case 'caudal': return 'm³/s';
      default: return '';
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowTrendAnalysis(false);
    setTrendResult(null);
    if (currentChart) {
      currentChart.destroy();
      setCurrentChart(null);
    }
  };

  const resetZoom = () => {
    if (currentChart) {
      currentChart.resetZoom();
    }
  };

  const addTrendLineToChart = (
    trends: TrendComputation[],
    dataSegments: Array<Array<{ x: number; y: number }>>
  ) => {
    if (!currentChart || trends.length !== 2 || dataSegments.length !== 2) return;

    const [trend1, trend2] = trends;
    const [data1, data2] = dataSegments;

    const minX1 = data1[0].x;
    const maxX1 = data1[data1.length - 1].x;
    const y1_inicio = trend1.slope * minX1 + trend1.intercept;
    const y1_fim = trend1.slope * maxX1 + trend1.intercept;

    const minX2 = data2[0].x;
    const maxX2 = data2[data2.length - 1].x;
    const y2_inicio = trend2.slope * minX2 + trend2.intercept;
    const y2_fim = trend2.slope * maxX2 + trend2.intercept;

    removeTrendLineFromChart();

    (currentChart.data.datasets as any[]).push({
      label: 'Tendência (1ª metade)',
      type: 'line',
      data: [
        { x: new Date(minX1), y: y1_inicio },
        { x: new Date(maxX1), y: y1_fim }
      ],
      borderColor: 'rgba(255, 99, 132, 0.8)',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      tension: 0
    } as any);

    (currentChart.data.datasets as any[]).push({
      label: 'Tendência (2ª metade)',
      type: 'line',
      data: [
        { x: new Date(minX2), y: y2_inicio },
        { x: new Date(maxX2), y: y2_fim }
      ],
      borderColor: 'rgba(220,38,38,0.9)',
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointRadius: 0,
      fill: false,
      tension: 0
    } as any);

    currentChart.update();
  };

  const removeTrendLineFromChart = () => {
    if (!currentChart) return;
    const labelsToRemove = ['Tendência (1ª metade)', 'Tendência (2ª metade)'];
    const datasets = currentChart.data.datasets as any[];
    const remaining = datasets.filter(ds => !labelsToRemove.includes(ds.label));
    currentChart.data.datasets = remaining;
    currentChart.update();
  };

  const handleTrendAnalysis = () => {
    if (showTrendAnalysis) {
      setShowTrendAnalysis(false);
      setTrendResult(null);
      removeTrendLineFromChart();
    } else {
      if (lastSortedData.length >= 4) {
        const meio = Math.floor(lastSortedData.length / 2);
        const primeiraMetade = lastSortedData.slice(0, meio);
        const segundaMetade = lastSortedData.slice(meio);

        if (primeiraMetade.length >= 2 && segundaMetade.length >= 2) {
          const trend1 = computeTrend(primeiraMetade);
          const trend2 = computeTrend(segundaMetade);
          setTrendResult(trend2);
          addTrendLineToChart([trend1, trend2], [primeiraMetade, segundaMetade]);
        } else {
          alert('Dados insuficientes em uma das metades.');
        }
      } else {
        alert('São necessários pelo menos 4 pontos de dados.');
      }
      setShowTrendAnalysis(true);
    }
  };

  const loadInfoData = async () => {
    if (!wellData[selectedVariable]) return;
    
    if (selectedVariable === 'temperaturas') {
      setInfoTableData(null);
      setSummaryData(null);
      setLoadingInfo(false);
      return;
    }

    setLoadingInfo(true);
    const info: InfoTableData = {};
    const contagem: SummaryData = { aumento: 0, diminuicao: 0, semTendencia: 0 };
    const wells = wellData[selectedVariable];
    const codigos = Object.keys(wells);

    const promises = codigos.map(async (codigo) => {
      try {
        let historicalData: any[] = [];
        if (selectedVariable === 'precipitacao') {
          historicalData = await loadPrecipitacaoHistoricalData(codigo);
        } else {
          const idParaHistorico = codigo;
          historicalData = await fetchWellHistory(selectedVariable, idParaHistorico, 'todos');
        }

        if (historicalData.length === 0) return;

        const trendData = historicalData
          .map((record) => {
            const value = getValueFromWell(record, selectedVariable);
            if (value === null) return null;
            return {
              x: new Date(record.data).getTime(),
              y: value
            };
          })
          .filter((d): d is { x: number; y: number } => d !== null && !isNaN(d.x) && !isNaN(d.y));

        if (trendData.length < 2) return;

        const meio = Math.floor(trendData.length / 2);
        const segundaMetade = trendData.slice(meio);
        if (segundaMetade.length < 2) return;
        const trend = computeTrend(segundaMetade);

        const years = historicalData
          .map(d => new Date(d.data).getFullYear())
          .filter((y, i, arr) => arr.indexOf(y) === i)
          .sort((a, b) => a - b);
        const periodo = years.length > 1 ? `${years[0]}-${years[years.length-1]}` : years[0].toString();

        let tendenciaTexto = '';
        if (trend.pValue < 0.05) {
          if (trend.direction === 'increasing') {
            tendenciaTexto = 'Aumento';
            contagem.aumento += 1;
          } else {
            tendenciaTexto = 'Diminuição';
            contagem.diminuicao += 1;
          }
        } else {
          tendenciaTexto = 'Sem tendência';
          contagem.semTendencia += 1;
        }

        info[codigo] = { periodo, tendencia: tendenciaTexto };
      } catch (error) {
        console.error(`Erro ao processar poço ${codigo}:`, error);
      }
    });

    await Promise.all(promises);
    setInfoTableData(info);
    setSummaryData(contagem);
    setLoadingInfo(false);
  };

  const toggleInfo = () => {
    if (!infoVisible) {
      loadInfoData();
    } else {
      setInfoTableData(null);
      setSummaryData(null);
    }
    setInfoVisible(!infoVisible);
  };

  return (
    <div className="flex-grow w-full py-12 pt-24">
      <div className="container mx-auto px-6 mt-6">
        <div className="mb-6 text-gray-700 text-base font-normal">
          Foi criada uma interface gráfica orientada para o utilizador, que permite explorar de forma dinâmica as tendências históricas das variáveis relevantes.
        </div>
        
        <div className="mb-4 flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <label htmlFor="variableFilter" className="font-semibold text-blue-900 whitespace-nowrap">
              Variável:
            </label>
            <select
              id="variableFilter"
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[140px] appearance-none bg-white bg-no-repeat bg-right pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              {variables.map(variable => (
                <option key={variable.value} value={variable.value}>
                  {variable.label}
                </option>
              ))}
            </select>
          </div>
          
          {selectedVariable !== 'precipitacao' && selectedVariable !== 'temperaturas' && selectedVariable !== 'caudal' && (
            <div className="flex items-center space-x-2">
              <label htmlFor="sistemaAquiferoFilter" className="font-semibold text-blue-900 whitespace-nowrap">
                Sistema Aquífero:
              </label>
              <select
                id="sistemaAquiferoFilter"
                value={selectedSistemaAquifero}
                onChange={(e) => setSelectedSistemaAquifero(e.target.value)}
                className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[200px] appearance-none bg-white bg-no-repeat bg-right pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="todos">Todos</option>
                {sistemaAquiferoOptions.filter(option => {
                  // Esconder opções específicas conforme a variável selecionada
                  if (selectedVariable === 'profundidade') {
                    return option !== 'T3 - BACIA DO TEJO-SADO / MARGEM ESQUERDA';
                  }
                  if (selectedVariable === 'nitrato') {
                    return option !== 'T3 - BACIA DO TEJO-SADO / MARGEM ESQUERDA' &&
                           option !== 'T7 - ALUVIÕES DO TEJO';
                  }
                  return true;
                }).map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <label htmlFor="wellFilter" className="font-semibold text-blue-900 whitespace-nowrap">
              Pontos:
            </label>
            <select
              id="wellFilter"
              value={selectedPoint}
              onChange={(e) => {
                const codigo = e.target.value;
                setSelectedPoint(codigo);
                if (codigo) {
                  focusOnWell(codigo);
                } else {
                  if (mapRef.current) {
                    mapRef.current.setView([39.5, -8], 8);
                  }
                }
              }}
              className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] appearance-none bg-white bg-no-repeat bg-right pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">Todos</option>
              {wellData[selectedVariable] && 
                Object.keys(wellData[selectedVariable]).map(codigo => (
                  <option key={codigo} value={codigo}>{codigo}</option>
                ))
              }
            </select>
          </div>
        </div>

        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Carregando dados...</span>
            </div>
          </div>
        )}

        {!loading && (!wellData[selectedVariable] || Object.keys(wellData[selectedVariable] || {}).length === 0) && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-yellow-600">⚠️</div>
              <div className="text-yellow-800">
                <strong>Nenhum dado encontrado.</strong> 
                {!process.env.REACT_APP_SUPABASE_URL ? (
                  <span> Configure as variáveis de ambiente REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY para conectar à base de dados.</span>
                ) : (
                  <span> Verifique se existem dados na tabela correspondente para os filtros selecionados.</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div id="map" style={{ height: '500px' }}></div>
        
        <div className="mt-2 flex flex-col items-start">
          <button 
            onClick={toggleInfo}
            className="px-4 py-2 bg-gray-100 text-blue-800 rounded hover:bg-gray-200 font-semibold transition"
          >
            {infoVisible ? '× Fechar Info' : '+ Info'}
          </button>
          
          {infoVisible && (
            <div className="mt-2 w-full space-y-4">
              {loadingInfo ? (
                <div className="p-4 text-center text-gray-600">Carregando informações dos poços...</div>
              ) : infoTableData && Object.keys(infoTableData).length > 0 ? (
                <>
                  <table className="min-w-full border text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1">Poço</th>
                        <th className="border px-2 py-1">Período</th>
                        <th className="border px-2 py-1">Tendência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(infoTableData).map(([codigo, data]) => (
                        <tr key={codigo}>
                          <td className="border px-2 py-1">
                            <button 
                              className="show-chart-btn" 
                              title="Ver gráfico"
                              onClick={() => {
                                const well = wellData[selectedVariable]?.[codigo];
                                if (well) openChartModal(codigo, well);
                              }}
                            >
                              📈
                            </button>
                            {codigo}
                           </td>
                          <td className="border px-2 py-1">{data.periodo}</td>
                          <td className="border px-2 py-1">{data.tendencia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {summaryData && (
                    <table className="min-w-full border text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-2 py-1">Tendência</th>
                          <th className="border px-2 py-1">Nº de Poços</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border px-2 py-1">Aumento</td>
                          <td className="border px-2 py-1 text-center">{summaryData.aumento}</td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1">Diminuição</td>
                          <td className="border px-2 py-1 text-center">{summaryData.diminuicao}</td>
                        </tr>
                        <tr>
                          <td className="border px-2 py-1">Sem tendência significativa</td>
                          <td className="border px-2 py-1 text-center">{summaryData.semTendencia}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-gray-600">Nenhum dado encontrado para os poços desta variável.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="chart-modal">
          <div className="bg-white p-6 rounded shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-lg font-bold mb-2">{modalTitle}</h2>
            
            <div className="mb-2 text-sm text-gray-600">
              Use o <strong>scroll do mouse</strong> para dar zoom,
              <strong>clique e arraste</strong> para selecionar uma área.<br />
              <button
                onClick={resetZoom}
                className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
              >
                Resetar Zoom
              </button>
              {trendVariables.includes(selectedVariable) && (
                <button
                  onClick={handleTrendAnalysis}
                  className="mt-2 ml-2 px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                >
                  {showTrendAnalysis ? 'Fechar análise de tendência' : 'Análise de tendência'}
                </button>
              )}
            </div>
            
            <div className="flex flex-row">
              <canvas 
                ref={chartRef}
                id="wellChart" 
                width="400" 
                height="300"
                style={{ maxWidth: '70vw', maxHeight: '70vh' }}
              ></canvas>
              {showTrendAnalysis && trendVariables.includes(selectedVariable) && (
                <div
                  className="ml-6 p-4 bg-gray-50 border border-gray-200 rounded shadow text-xs"
                  style={{ minWidth: '220px', maxWidth: '320px' }}
                >
                  <div className="font-semibold text-base mb-2">Análise de tendência</div>
                  {trendResult ? (
                    <div className="text-gray-600">
                      <div><strong>Período recente:</strong> {
                        trendResult.direction === 'increasing'
                          ? trendDirectionText[selectedVariable]?.aumento || 'Aumento'
                          : trendResult.direction === 'decreasing'
                          ? trendDirectionText[selectedVariable]?.diminuicao || 'Diminuição'
                          : 'Sem tendência significativa'
                      }</div>
                      <div>
                        <strong>Variação anual:</strong> {(trendResult.slope * MS_PER_YEAR).toFixed(4)}{' '}
  {selectedVariable === 'nitrato' ? 'mg/(L.ano)' : `${getUnit(selectedVariable)}/ano`}
                      </div>
                    </div>
                  ) : lastSortedData.length < 4 ? (
                    <div className="text-gray-600">Não há dados suficientes para análise de tendência.</div>
                  ) : (
                    <div className="text-gray-600">Calculando tendência...</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visual;