import type {
  GeocodeResult,
  HouseholdInput,
  HouseholdStatsResult,
  SolarPotentialResult,
} from '../api/types';
import {
  COUNTY_TOTALS,
  DEFAULT_COUNTY_TOTALS,
  EGRID_CAMX_KG_CO2_PER_KWH,
} from '../data/countyTotals';
import { kWhToKgCo2 } from './carbon';
import { pctOfTotal } from './percentages';

/**
 * Pure, client-side household stats calculation. Shared by the mock and HTTP
 * clients so the UI sees identical output regardless of where solar data came
 * from.
 */
export function computeHouseholdStats({
  input,
  geocode,
  solar,
}: {
  input: HouseholdInput;
  geocode: GeocodeResult;
  solar: SolarPotentialResult;
}): HouseholdStatsResult {
  const totals = COUNTY_TOTALS[geocode.county] ?? DEFAULT_COUNTY_TOTALS;

  const co2EmittedKg = kWhToKgCo2(
    input.annualConsumptionKwh,
    EGRID_CAMX_KG_CO2_PER_KWH,
  );
  const co2AvoidedKg = kWhToKgCo2(
    solar.annualGenerationKwh,
    EGRID_CAMX_KG_CO2_PER_KWH,
  );

  return {
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
  };
}
