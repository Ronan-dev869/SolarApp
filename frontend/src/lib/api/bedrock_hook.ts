import { useCallback, useState } from 'react';
import { sendMessage, type BedrockMessage } from './bedrock';
import { useHouseholdStore } from '../store/household';
import {
  computeNeighborAverages,
  type NeighborAverages,
} from '../calc/neighborAverages';
import type { ResolvedHousehold } from './types';

const SYSTEM_PROMPT =
  'You are an energy-efficiency analyst. Given a household and synthetic averages for its 5 nearest neighbors, produce a concise (3-5 sentence) comparison of the household\'s carbon emissions and solar generation versus the neighborhood. Call out whether the household is above or below the neighborhood average, by roughly what margin, and one actionable takeaway. Do not fabricate precise addresses or claim the neighbor data is real-time.';

function round(n: number): number {
  return Math.round(n);
}

export function buildComparisonPrompt(
  resolved: ResolvedHousehold,
  neighbors: NeighborAverages,
): string {
  const { input, geocode, stats } = resolved;

  const appliances = input.appliances
    .map(
      (a) =>
        `  - ${a.name}: ${a.count} unit(s) x ${a.hoursPerDay} h/day`,
    )
    .join('\n');

  const neighborRows = neighbors.houses
    .map(
      (h) =>
        `  - House ${h.id}: ${round(h.annualConsumptionKwh)} kWh/yr consumed, ${round(h.annualSolarKwh)} kWh/yr solar, ${round(h.co2EmittedKg)} kg CO2/yr`,
    )
    .join('\n');

  return `Compare the following household to the average of its 5 nearest neighbors.

HOUSEHOLD
- Location: lat ${geocode.lat.toFixed(4)}, lon ${geocode.lon.toFixed(4)} (${geocode.county} County)
- Annual consumption: ${round(stats.annualConsumptionKwh)} kWh/yr
- Annual solar generation: ${round(stats.annualGenerationKwh)} kWh/yr
- Annual CO2 emitted: ${round(stats.co2EmittedKg)} kg/yr
- Annual CO2 avoided by solar: ${round(stats.co2AvoidedKg)} kg/yr
- Appliances in use:
${appliances}

NEIGHBORHOOD (5 synthetic nearest houses)
${neighborRows}

NEIGHBORHOOD AVERAGES
- Avg consumption: ${round(neighbors.avgAnnualConsumptionKwh)} kWh/yr
- Avg solar generation: ${round(neighbors.avgAnnualSolarKwh)} kWh/yr
- Avg CO2 emitted: ${round(neighbors.avgCo2EmittedKg)} kg/yr

Write the comparison now.`;
}

export interface UseNeighborComparisonResult {
  run: () => Promise<void>;
  reset: () => void;
  result: string | null;
  loading: boolean;
  error: string | null;
}

export function useNeighborComparison(): UseNeighborComparisonResult {
  const resolved = useHouseholdStore((s) => s.resolved);
  const setNeighbors = useHouseholdStore((s) => s.setNeighbors);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!resolved) {
      setError('Submit the household form before comparing to neighbors.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const neighbors = computeNeighborAverages(
        resolved.geocode.lat,
        resolved.geocode.lon,
        resolved.solar.carbonOffsetFactorKgPerMwh,
      );
      // Push into the store so the map can render neighbor bars in parallel
      // with the LLM call — user sees the visual comparison immediately.
      setNeighbors(neighbors);
      const userPrompt = buildComparisonPrompt(resolved, neighbors);
      const messages: BedrockMessage[] = [
        { role: 'user', content: userPrompt },
      ];
      const data = await sendMessage(messages, SYSTEM_PROMPT);
      setResult(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  }, [resolved, setNeighbors]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { run, reset, result, loading, error };
}
