import { ColumnLayer } from '@deck.gl/layers';
import type { HouseholdStatsResult } from '../../lib/api/types';

interface BarDatum {
  position: [number, number];
  valueKg: number;
  label: string;
  color: [number, number, number, number];
}

const LAT_OFFSET = 0.00006; // ~7 meters at SoCal latitude
const RADIUS_METERS = 6;
const ELEVATION_SCALE = 0.05; // 1 kg CO2 → 0.05 m column height

export function buildSolarBarsLayers(
  stats: HouseholdStatsResult,
  center: { lat: number; lon: number },
): ColumnLayer<BarDatum>[] {
  const data: BarDatum[] = [
    {
      position: [center.lon - LAT_OFFSET, center.lat],
      valueKg: stats.co2AvoidedKg,
      label: 'CO₂ avoided by solar',
      color: [34, 197, 94, 230],
    },
    {
      position: [center.lon + LAT_OFFSET, center.lat],
      valueKg: stats.co2EmittedKg,
      label: 'CO₂ emitted by household',
      color: [239, 68, 68, 230],
    },
  ];

  return [
    new ColumnLayer<BarDatum>({
      id: 'solar-bars',
      data,
      diskResolution: 24,
      radius: RADIUS_METERS,
      extruded: true,
      pickable: true,
      elevationScale: ELEVATION_SCALE,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getElevation: (d) => d.valueKg,
      material: {
        ambient: 0.6,
        diffuse: 0.7,
        shininess: 32,
        specularColor: [60, 64, 70],
      },
    }),
  ];
}
