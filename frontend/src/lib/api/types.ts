/**
 * Shared API contract types.
 *
 * These types are the contract between the frontend and whatever provides data
 * (mock today, AWS Lambda tomorrow). When the backend is live, only the client
 * implementation changes; consumers of these types stay identical.
 */

export interface HouseholdInput {
  address: string;
  annualConsumptionKwh: number;
  panelCount: number;
  appliances: ApplianceEntry[];
}

export interface ApplianceEntry {
  name: string;
  count: number;
  hoursPerDay: number;
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  county: string;
  formattedAddress: string;
}

export type SolarConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'ESTIMATED';

export interface SolarPotentialResult {
  annualGenerationKwh: number;
  panelCapacityWatts: number;
  maxArrayPanelsCount: number;
  confidence: SolarConfidence;
  carbonOffsetFactorKgPerMwh: number;
}

export interface HouseholdStatsResult {
  annualGenerationKwh: number;
  annualConsumptionKwh: number;
  co2AvoidedKg: number;
  co2EmittedKg: number;
  netCo2Kg: number;
  county: string;
  countySolarPctContribution: number;
  countyFootprintPctContribution: number;
}

export interface ResolvedHousehold {
  input: HouseholdInput;
  geocode: GeocodeResult;
  solar: SolarPotentialResult;
  stats: HouseholdStatsResult;
}
