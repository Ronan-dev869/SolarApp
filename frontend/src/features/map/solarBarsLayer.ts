import { ColumnLayer } from '@deck.gl/layers';
import type { Layer } from '@deck.gl/core';
import type { HouseholdStatsResult } from '../../lib/api/types';
import type { NeighborAverages } from '../../lib/calc/neighborAverages';

interface BarDatum {
  position: [number, number];
  height: number;
  color: [number, number, number, number];
  label: string;
}

interface SpotlightDatum {
  position: [number, number];
  color: [number, number, number, number];
  radius: number;
  height: number;
}

const LAT_OFFSET = 0.00008; // ~9 m — paired bars per house
const RADIUS_METERS = 4.2;
const HALO_RADIUS_METERS = 9;
const HALO_HEIGHT_METERS = 0.3;
const MAX_BAR_HEIGHT_METERS = 50;
const BAR_SOFT_CAP_KG = 1500;

// Sunrise palette: gold sun for solar, warm dawn coral for CO₂.
const SOLAR_RGB: [number, number, number] = [255, 198, 88]; // sun gold
const CO2_RGB: [number, number, number] = [233, 113, 86]; // dawn coral
const HALO_SOLAR_RGB: [number, number, number] = [255, 224, 160];
const HALO_CO2_RGB: [number, number, number] = [245, 180, 160];

const USER_ALPHA = 235;
const NEIGHBOR_ALPHA = 185;
const HALO_ALPHA = 80;

// Compress very tall bars into a readable range — sqrt curve preserves
// ordering but keeps a 300 kg and a 3000 kg reading both on-screen.
function scaleBarHeight(valueKg: number): number {
  if (valueKg <= 0) return 0;
  const normalized = Math.sqrt(valueKg / BAR_SOFT_CAP_KG);
  return Math.min(MAX_BAR_HEIGHT_METERS, normalized * MAX_BAR_HEIGHT_METERS);
}

function buildPair(
  center: { lat: number; lon: number },
  solarKg: number,
  emittedKg: number,
  labelPrefix: string,
  alpha: number,
): BarDatum[] {
  return [
    {
      position: [center.lon - LAT_OFFSET, center.lat],
      height: scaleBarHeight(solarKg),
      label: `${labelPrefix} · Clean energy`,
      color: [...SOLAR_RGB, alpha],
    },
    {
      position: [center.lon + LAT_OFFSET, center.lat],
      height: scaleBarHeight(emittedKg),
      label: `${labelPrefix} · CO₂ footprint`,
      color: [...CO2_RGB, alpha],
    },
  ];
}

function buildHalos(center: { lat: number; lon: number }): SpotlightDatum[] {
  return [
    {
      position: [center.lon - LAT_OFFSET, center.lat],
      color: [...HALO_SOLAR_RGB, HALO_ALPHA],
      radius: HALO_RADIUS_METERS,
      height: HALO_HEIGHT_METERS,
    },
    {
      position: [center.lon + LAT_OFFSET, center.lat],
      color: [...HALO_CO2_RGB, HALO_ALPHA],
      radius: HALO_RADIUS_METERS,
      height: HALO_HEIGHT_METERS,
    },
  ];
}

export function buildSolarBarsLayers(
  stats: HouseholdStatsResult,
  center: { lat: number; lon: number },
  neighbors?: NeighborAverages | null,
): Layer[] {
  const userBars = buildPair(
    center,
    stats.co2AvoidedKg,
    stats.co2EmittedKg,
    'You',
    USER_ALPHA,
  );
  const userHalos = buildHalos(center);

  const neighborBars = neighbors
    ? neighbors.houses.flatMap((h) =>
        buildPair(
          { lat: h.lat, lon: h.lon },
          h.co2AvoidedKg,
          h.co2EmittedKg,
          `Neighbor ${h.id}`,
          NEIGHBOR_ALPHA,
        ),
      )
    : [];

  const neighborHalos = neighbors
    ? neighbors.houses.flatMap((h) => buildHalos({ lat: h.lat, lon: h.lon }))
    : [];

  return [
    // Flat ground halos — "plant" the bars so they don't appear to hover.
    new ColumnLayer<SpotlightDatum>({
      id: 'solar-bar-halos',
      data: [...userHalos, ...neighborHalos],
      diskResolution: 32,
      radius: HALO_RADIUS_METERS,
      extruded: true,
      pickable: false,
      elevationScale: 1,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getElevation: (d) => d.height,
      material: {
        ambient: 0.85,
        diffuse: 0.35,
        shininess: 6,
        specularColor: [30, 30, 30],
      },
    }),
    // Hexagonal prisms — sunrise-gold for generated, dawn-coral for emitted.
    new ColumnLayer<BarDatum>({
      id: 'solar-bars',
      data: [...userBars, ...neighborBars],
      diskResolution: 6,
      radius: RADIUS_METERS,
      extruded: true,
      pickable: true,
      elevationScale: 1,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getElevation: (d) => d.height,
      material: {
        ambient: 0.6,
        diffuse: 0.9,
        shininess: 22,
        specularColor: [55, 50, 40],
      },
    }),
  ];
}
