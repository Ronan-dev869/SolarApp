import { apiClient } from './client';
import type { HouseholdInput, ResolvedHousehold } from './types';

/**
 * Orchestrates the three backend calls for a single form submission.
 * Same orchestrator will be used against the real backend — only the
 * underlying `apiClient` implementation changes.
 */
export async function resolveHousehold(
  input: HouseholdInput,
): Promise<ResolvedHousehold> {
  const geocode = await apiClient.geocode(input.address);
  const solar = await apiClient.getSolarPotential({
    lat: geocode.lat,
    lon: geocode.lon,
    panelCount: input.panelCount,
  });
  const stats = await apiClient.getHouseholdStats({ input, geocode, solar });
  return { input, geocode, solar, stats };
}
