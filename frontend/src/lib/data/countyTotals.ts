/**
 * County-level aggregate solar generation and residential carbon footprint.
 * MOCK VALUES — representative order-of-magnitude figures for SoCal counties.
 * Replace with CEC + eGRID sourced data in the backend (ship as Lambda-bundled JSON).
 */

export interface CountyTotals {
  annualSolarGenerationKwh: number;
  annualResidentialCo2Kg: number;
}

export const COUNTY_TOTALS: Record<string, CountyTotals> = {
  'Los Angeles': {
    annualSolarGenerationKwh: 3_200_000_000,
    annualResidentialCo2Kg: 20_000_000_000,
  },
  Orange: {
    annualSolarGenerationKwh: 1_400_000_000,
    annualResidentialCo2Kg: 8_500_000_000,
  },
  'San Diego': {
    annualSolarGenerationKwh: 1_800_000_000,
    annualResidentialCo2Kg: 7_200_000_000,
  },
  Riverside: {
    annualSolarGenerationKwh: 2_100_000_000,
    annualResidentialCo2Kg: 6_800_000_000,
  },
  'San Bernardino': {
    annualSolarGenerationKwh: 2_400_000_000,
    annualResidentialCo2Kg: 7_500_000_000,
  },
  Ventura: {
    annualSolarGenerationKwh: 450_000_000,
    annualResidentialCo2Kg: 2_100_000_000,
  },
};

// Fallback for counties not in the table.
export const DEFAULT_COUNTY_TOTALS: CountyTotals = {
  annualSolarGenerationKwh: 1_000_000_000,
  annualResidentialCo2Kg: 5_000_000_000,
};

/** EPA eGRID CAMX subregion CO2 output emission rate (kg CO2 per kWh). */
export const EGRID_CAMX_KG_CO2_PER_KWH = 0.227;
