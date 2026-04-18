import { EGRID_CAMX_KG_CO2_PER_KWH } from '../data/countyTotals';

export function kWhToKgCo2(
  kWh: number,
  factorKgPerKwh: number = EGRID_CAMX_KG_CO2_PER_KWH,
): number {
  return kWh * factorKgPerKwh;
}
