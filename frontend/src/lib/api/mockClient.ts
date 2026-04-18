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
import {
  COUNTY_TOTALS,
  DEFAULT_COUNTY_TOTALS,
  EGRID_CAMX_KG_CO2_PER_KWH,
} from '../data/countyTotals';
import { kWhToKgCo2 } from '../calc/carbon';
import { pctOfTotal } from '../calc/percentages';

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Parser for the real Google Solar API response shape. Works on both the mock
 * object and a live API payload, so the production client can reuse it.
 *
 * Picks the closest `solarPanelConfigs` entry for the requested panelCount,
 * applies a DC→AC derate of 0.85, and maps confidence from imageryQuality.
 */
function parseGoogleSolarResponse(
  payload: typeof MOCK_GOOGLE_SOLAR_RESPONSE,
  panelCount: number,
): SolarPotentialResult {
  const { solarPotential, imageryQuality } = payload;
  const configs = solarPotential.solarPanelConfigs;

  const closest = configs.reduce((best, cfg) =>
    Math.abs(cfg.panelsCount - panelCount) <
    Math.abs(best.panelsCount - panelCount)
      ? cfg
      : best,
  );

  const scaled =
    closest.yearlyEnergyDcKwh * (panelCount / closest.panelsCount);
  const ac = scaled * 0.85;

  return {
    annualGenerationKwh: Math.round(ac),
    panelCapacityWatts: solarPotential.panelCapacityWatts,
    maxArrayPanelsCount: solarPotential.maxArrayPanelsCount,
    confidence: imageryQuality,
    carbonOffsetFactorKgPerMwh: solarPotential.carbonOffsetFactorKgPerMwh,
  };
}

export const mockClient: ApiClient = {
  async geocode(_address: string): Promise<GeocodeResult> {
    // Ignores input — always returns the hardcoded Pasadena household.
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
    const totals = COUNTY_TOTALS[geocode.county] ?? DEFAULT_COUNTY_TOTALS;

    const co2EmittedKg = kWhToKgCo2(
      input.annualConsumptionKwh,
      EGRID_CAMX_KG_CO2_PER_KWH,
    );
    const co2AvoidedKg = kWhToKgCo2(
      solar.annualGenerationKwh,
      EGRID_CAMX_KG_CO2_PER_KWH,
    );

    return delay({
      annualGenerationKwh: solar.annualGenerationKwh,
      annualConsumptionKwh: input.annualConsumptionKwh,
      co2AvoidedKg,
      co2EmittedKg,
      netCo2Kg: co2EmittedKg - co2AvoidedKg,
      county: geocode.county,
      countySolarPctContribution: pctOfTotal(
        solar.annualGenerationKwh,
        totals.annualSolarGenerationKwh,
      ),
      countyFootprintPctContribution: pctOfTotal(
        co2EmittedKg,
        totals.annualResidentialCo2Kg,
      ),
    });
  },
};
