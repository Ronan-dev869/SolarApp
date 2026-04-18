import type { SolarConfidence, SolarPotentialResult } from './types';

export interface GoogleSolarPanelConfig {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
}

export interface GoogleSolarBuildingInsightsResponse {
  imageryQuality: SolarConfidence;
  solarPotential: {
    maxArrayPanelsCount: number;
    panelCapacityWatts: number;
    carbonOffsetFactorKgPerMwh: number;
    solarPanelConfigs: GoogleSolarPanelConfig[];
  };
}

const DC_TO_AC_DERATE = 0.85;

/**
 * Picks the solarPanelConfigs entry closest to the requested panel count,
 * scales linearly, and applies a DC→AC derate. Shared by the mock and HTTP
 * clients so the contract cannot drift between them.
 */
export function parseGoogleSolarResponse(
  payload: GoogleSolarBuildingInsightsResponse,
  panelCount: number,
): SolarPotentialResult {
  const { solarPotential, imageryQuality } = payload;
  const configs = solarPotential.solarPanelConfigs;

  if (!configs || configs.length === 0) {
    throw new Error('Google Solar response has no solarPanelConfigs');
  }

  const closest = configs.reduce((best, cfg) =>
    Math.abs(cfg.panelsCount - panelCount) <
    Math.abs(best.panelsCount - panelCount)
      ? cfg
      : best,
  );

  const scaled =
    closest.yearlyEnergyDcKwh * (panelCount / closest.panelsCount);
  const ac = scaled * DC_TO_AC_DERATE;

  return {
    annualGenerationKwh: Math.round(ac),
    panelCapacityWatts: solarPotential.panelCapacityWatts,
    maxArrayPanelsCount: solarPotential.maxArrayPanelsCount,
    confidence: imageryQuality,
    carbonOffsetFactorKgPerMwh: solarPotential.carbonOffsetFactorKgPerMwh,
  };
}
