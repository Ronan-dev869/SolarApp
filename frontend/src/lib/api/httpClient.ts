import type { ApiClient } from './client';
import type {
  GeocodeResult,
  HouseholdInput,
  HouseholdStatsResult,
  SolarPotentialResult,
} from './types';
import { MOCK_GEOCODE } from '../data/mockSolarResponse';
import { computeHouseholdStats } from '../calc/householdStats';
import {
  parseGoogleSolarResponse,
  type GoogleSolarBuildingInsightsResponse,
} from './googleSolarParser';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

async function fetchBuildingInsights(
  lat: number,
  lon: number,
): Promise<GoogleSolarBuildingInsightsResponse> {
  const url = `${API_BASE_URL}/solar/building-insights?lat=${lat}&lng=${lon}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (cause) {
    throw new Error(
      `Network error calling Solar API at ${url}. Is the Flask backend running?`,
      { cause },
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Solar API returned ${response.status}: ${body.slice(0, 200)}`,
    );
  }

  return (await response.json()) as GoogleSolarBuildingInsightsResponse;
}

export const httpClient: ApiClient = {
  async geocode(_address: string): Promise<GeocodeResult> {
    // Backend currently has no geocoding endpoint, so every submission
    // resolves to the same Pasadena household. Swap to Amazon Location
    // Service when the backend exposes a /geocode route.
    return { ...MOCK_GEOCODE };
  },

  async getSolarPotential({
    lat,
    lon,
    panelCount,
  }): Promise<SolarPotentialResult> {
    const payload = await fetchBuildingInsights(lat, lon);
    return parseGoogleSolarResponse(payload, panelCount);
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
    return computeHouseholdStats({ input, geocode, solar });
  },
};
