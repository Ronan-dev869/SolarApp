import type { ApiClient } from './client';
import type {
  GeocodeResult,
  HouseholdInput,
  HouseholdStatsResult,
  SolarPotentialResult,
} from './types';
import {
  MOCK_GEOCODE,
  MOCK_GOOGLE_SOLAR_RESPONSE,
} from '../data/mockSolarResponse';
import { computeHouseholdStats } from '../calc/householdStats';
import { parseGoogleSolarResponse } from './googleSolarParser';

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const mockClient: ApiClient = {
  async geocode(_address: string): Promise<GeocodeResult> {
    return delay({ ...MOCK_GEOCODE });
  },

  async getSolarPotential({
    panelCount,
  }): Promise<SolarPotentialResult> {
    return delay(parseGoogleSolarResponse(MOCK_GOOGLE_SOLAR_RESPONSE, panelCount));
  },

  async getHouseholdStats({
    input,
    geocode,
    solar,
  }: {
    input: HouseholdInput;
    geocode: GeocodeResult;
    solar: SolarPotentialResult;
  }): Promise<HouseholdStatsResult> {
    return delay(computeHouseholdStats({ input, geocode, solar }));
  },
};
