import type {
  GeocodeResult,
  HouseholdInput,
  HouseholdStatsResult,
  SolarPotentialResult,
} from './types';

/**
 * The swap boundary.
 *
 * Chooses between `mockClient` (hardcoded Pasadena response) and `httpClient`
 * (Flask backend → Google Solar API) based on `VITE_API_MODE`. Set
 * `VITE_API_MODE=mock` to force the mock, anything else hits the real backend.
 */
export interface ApiClient {
  geocode(address: string): Promise<GeocodeResult>;
  getSolarPotential(args: {
    lat: number;
    lon: number;
    panelCount: number;
  }): Promise<SolarPotentialResult>;
  getHouseholdStats(args: {
    input: HouseholdInput;
    geocode: GeocodeResult;
    solar: SolarPotentialResult;
  }): Promise<HouseholdStatsResult>;
}

import { mockClient } from './mockClient';
import { httpClient } from './httpClient';

const apiMode =
  (import.meta.env.VITE_API_MODE as string | undefined) ?? 'http';

export const apiClient: ApiClient = apiMode === 'mock' ? mockClient : httpClient;
