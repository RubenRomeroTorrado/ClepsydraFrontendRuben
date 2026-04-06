import { calculateSenSlope, mannKendallTest, computeTrend } from './trend';

describe('calculateSenSlope', () => {
  it('should return zero slope for less than 2 points', () => {
    expect(calculateSenSlope([])).toEqual({slope: 0, intercept: 0});
    expect(calculateSenSlope([{x: 1, y: 1}])).toEqual({slope: 0, intercept: 0});
  });

  it('should calculate slope for two points', () => {
    const data = [{x: 0, y: 0}, {x: 1, y: 1}];
    const result = calculateSenSlope(data);
    expect(result.slope).toBe(1);
    expect(result.intercept).toBe(0);
  });

  it('should calculate median slope for multiple points', () => {
    const data = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 4}];
    const result = calculateSenSlope(data);
    // Slopes: 1-0=1, 4-0=2, 4-1=3; median=2
    expect(result.slope).toBe(2);
  });
});

describe('mannKendallTest', () => {
  it('should return no trend for less than 3 points', () => {
    expect(mannKendallTest([]).trend).toBe('no_trend');
    expect(mannKendallTest([1]).trend).toBe('no_trend');
    expect(mannKendallTest([1, 2]).trend).toBe('no_trend');
  });

  it('should detect increasing trend', () => {
    const data = [1, 2, 3, 4, 5];
    const result = mannKendallTest(data);
    expect(result.trend).toBe('increasing');
    expect(result.pValue).toBeLessThan(0.05);
  });

  it('should detect decreasing trend', () => {
    const data = [5, 4, 3, 2, 1];
    const result = mannKendallTest(data);
    expect(result.trend).toBe('decreasing');
    expect(result.pValue).toBeLessThan(0.05);
  });

  it('should detect no trend for random data', () => {
    const data = [1, 3, 2, 4, 1];
    const result = mannKendallTest(data);
    expect(result.trend).toBe('no_trend');
  });
});

describe('computeTrend', () => {
  it('should return no trend for insufficient data', () => {
    const data = [{x: 1, y: 1}];
    const result = computeTrend(data);
    expect(result.direction).toBe('no_trend');
    expect(result.slope).toBe(0);
  });

  it('should compute trend for valid data', () => {
    const data = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}];
    const result = computeTrend(data);
    expect(result.slope).toBe(1);
    expect(result.direction).toBe('increasing');
  });
});