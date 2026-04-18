import type {
  GeocodeResult,
  HouseholdInput,
  HouseholdStatsResult,
  SolarPotentialResult,
} from './types';

/**
 * The swap boundary.
 *
 * Today this is satisfied by `mockClient.ts`.
 * Tomorrow it will be satisfied by `httpClient.ts` (API Gateway + Lambda).
 * Nothing in the UI layer should import anything other than this interface
 * and the factory below.
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

// Single place to flip from mock → real. When the Lambda layer is deployed,
// replace this with `httpClient` (or branch on `import.meta.env.VITE_API_MODE`).
export const apiClient: ApiClient = mockClient;
