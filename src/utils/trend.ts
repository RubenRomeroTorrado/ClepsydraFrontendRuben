export interface MannKendallResult {
  S: number;
  varS: number;
  Z: number;
  pValue: number;
  trend: 'increasing' | 'decreasing' | 'no_trend';
}

export interface TrendComputation {
  slope: number;
  intercept: number;
  pValue: number;
  direction: 'increasing' | 'decreasing' | 'no_trend';
}

/**
 * Calculate the Sen slope estimator for a time series.
 * @param data Array of {x: number, y: number} points, sorted by x.
 * @returns {slope, intercept} where slope is the median of all pairwise slopes.
 */
export function calculateSenSlope(data: Array<{x: number, y: number}>): {slope: number, intercept: number} {
  if (data.length < 2) {
    return {slope: 0, intercept: 0};
  }

  const slopes: number[] = [];
  for (let i = 0; i < data.length - 1; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const dx = data[j].x - data[i].x;
      const dy = data[j].y - data[i].y;
      if (dx !== 0) {
        slopes.push(dy / dx);
      }
    }
  }

  if (slopes.length === 0) {
    return {slope: 0, intercept: 0};
  }

  slopes.sort((a, b) => a - b);
  const slope = slopes[Math.floor(slopes.length / 2)];

  // Calculate intercept using median y and median x
  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);
  xValues.sort((a, b) => a - b);
  yValues.sort((a, b) => a - b);
  const medianX = xValues[Math.floor(xValues.length / 2)];
  const medianY = yValues[Math.floor(yValues.length / 2)];
  const intercept = medianY - slope * medianX;

  return {slope, intercept};
}

/**
 * Perform the Mann-Kendall test for monotonic trend.
 * @param data Array of numbers (the time series values).
 * @returns MannKendallResult with S, varS, Z, pValue, and trend direction.
 */
export function mannKendallTest(data: number[]): MannKendallResult {
  const n = data.length;
  if (n < 3) {
    return {
      S: 0,
      varS: 0,
      Z: 0,
      pValue: 1,
      trend: 'no_trend'
    };
  }

  let S = 0;
  // Calcular S (estadístico de Mann-Kendall)
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = data[j] - data[i];
      if (diff > 0) S++;
      else if (diff < 0) S--;
    }
  }

  // Calcular frecuencias de cada valor para ajuste por empates (ties)
  const freq: { [key: number]: number } = {};
  data.forEach(val => { freq[val] = (freq[val] || 0) + 1; });

  // Varianza de S bajo la hipótesis nula (sin tendencia)
  let varS = (n * (n - 1) * (2 * n + 5)) / 18;
  for (const g of Object.values(freq)) {
    if (g > 1) {
      varS -= (g * (g - 1) * (2 * g + 5)) / 18;
    }
  }

  // Si varS es cero o negativo (caso extremo), devolver valores por defecto
  if (varS <= 0) {
    return {
      S,
      varS: 0,
      Z: 0,
      pValue: 1,
      trend: 'no_trend'
    };
  }

  const Z = S / Math.sqrt(varS);
  // Aproximación del p-valor (dos colas) usando la distribución normal estándar
  const pValue = 2 * (1 - normalCDF(Math.abs(Z)));

  let trend: 'increasing' | 'decreasing' | 'no_trend' = 'no_trend';
  if (pValue < 0.05) {
    trend = Z > 0 ? 'increasing' : 'decreasing';
  }

  return { S, varS, Z, pValue, trend };
}

// Aproximación de la función de distribución acumulada normal estándar (Algoritmo de Abramowitz y Stegun)
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * x);
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return 1 - prob;
}

/**
 * Compute trend using Sen slope and Mann-Kendall test.
 * @param data Array of {x: number, y: number} points, sorted by x.
 * @returns TrendComputation with slope, intercept, pValue, direction.
 */
export function computeTrend(data: Array<{x: number, y: number}>): TrendComputation {
  if (data.length < 2) {
    return {
      slope: 0,
      intercept: 0,
      pValue: 1,
      direction: 'no_trend'
    };
  }

  const { slope: rawSlope, intercept } = calculateSenSlope(data);
  const yValues = data.map(d => d.y);
  const mkResult = mannKendallTest(yValues);

  return {
    slope: rawSlope, // pendiente en unidades de y por milisegundo (si x es timestamp en ms)
    intercept,
    pValue: mkResult.pValue,
    direction: mkResult.trend
  };
}