import type { ApiClient } from './client';
import type {
  GeocodeResult,
  HouseholdInput,
  HouseholdStatsResult,
  SolarPotentialResult,
} from './types';
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

interface GeocodeApiResponse {
  lat: number;
  lon: number;
  county: string;
  formattedAddress: string;
}

async function fetchGeocode(address: string): Promise<GeocodeApiResponse> {
  const url = `${API_BASE_URL}/geocode?address=${encodeURIComponent(address)}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (cause) {
    throw new Error(
      `Network error calling geocode API at ${url}. Is the Flask backend running?`,
      { cause },
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Geocode API returned ${response.status}: ${body.slice(0, 200)}`,
    );
  }

  return (await response.json()) as GeocodeApiResponse;
}

export const httpClient: ApiClient = {
  async geocode(address: string): Promise<GeocodeResult> {
    const result = await fetchGeocode(address);
    return {
      lat: result.lat,
      lon: result.lon,
      county: result.county,
      formattedAddress: result.formattedAddress,
    };
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
