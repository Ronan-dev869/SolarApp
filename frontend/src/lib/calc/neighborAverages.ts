import { EGRID_CAMX_KG_CO2_PER_KWH } from '../data/countyTotals';

export interface NeighborHouse {
  id: number;
  annualConsumptionKwh: number;
  annualSolarKwh: number;
  co2EmittedKg: number;
}

export interface NeighborAverages {
  houses: NeighborHouse[];
  avgAnnualConsumptionKwh: number;
  avgAnnualSolarKwh: number;
  avgCo2EmittedKg: number;
}

// Typical SoCal single-family baseline. Used to seed synthetic neighbors so
// the comparison doesn't collapse to the user's own values.
const BASELINE_CONSUMPTION_KWH = 10_500;
const BASELINE_SOLAR_KWH = 6_500;
const PERTURBATION = 0.15;
const NEIGHBOR_COUNT = 5;

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function seedFromLatLon(lat: number, lon: number): number {
  return (Math.floor(lat * 1000) ^ Math.floor(lon * 1000)) >>> 0;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Deterministically generate 5 synthetic "nearest houses" around the given
 * lat/lon and return their averages. Same coordinates always yield the same
 * output so the comparison is stable across retries.
 */
export function computeNeighborAverages(
  lat: number,
  lon: number,
): NeighborAverages {
  const rand = mulberry32(seedFromLatLon(lat, lon));
  const houses: NeighborHouse[] = Array.from({ length: NEIGHBOR_COUNT }, (_, i) => {
    const consumptionFactor = 1 + (rand() * 2 - 1) * PERTURBATION;
    const solarFactor = 1 + (rand() * 2 - 1) * PERTURBATION;
    const annualConsumptionKwh = BASELINE_CONSUMPTION_KWH * consumptionFactor;
    const annualSolarKwh = BASELINE_SOLAR_KWH * solarFactor;
    return {
      id: i + 1,
      annualConsumptionKwh,
      annualSolarKwh,
      co2EmittedKg: annualConsumptionKwh * EGRID_CAMX_KG_CO2_PER_KWH,
    };
  });

  return {
    houses,
    avgAnnualConsumptionKwh: mean(houses.map((h) => h.annualConsumptionKwh)),
    avgAnnualSolarKwh: mean(houses.map((h) => h.annualSolarKwh)),
    avgCo2EmittedKg: mean(houses.map((h) => h.co2EmittedKg)),
  };
}
