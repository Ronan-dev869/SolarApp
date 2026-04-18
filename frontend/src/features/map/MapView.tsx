import { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { useHouseholdStore } from '../../lib/store/household';
import { buildSolarBarsLayers } from './solarBarsLayer';

// SoCal bounding — initial camera frames LA → San Diego
const INITIAL_CENTER: [number, number] = [-117.5, 34.0];
const INITIAL_ZOOM = 7;
const HOUSE_ZOOM = 18;
const HOUSE_PITCH = 55;

// OpenFreeMap — free, no API key, vector tiles. Swap to Amazon Location Service
// style URL when AWS wiring lands; the rest of this file is unchanged.
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const resolved = useHouseholdStore((s) => s.resolved);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('load', () => {
      const overlay = new MapboxOverlay({
        interleaved: true,
        layers: [],
      });
      map.addControl(overlay as unknown as maplibregl.IControl);
      overlayRef.current = overlay;
    });

    return () => {
      overlayRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay || !resolved) return;

    const { geocode, stats } = resolved;

    map.flyTo({
      center: [geocode.lon, geocode.lat],
      zoom: HOUSE_ZOOM,
      pitch: HOUSE_PITCH,
      bearing: 0,
      duration: 2200,
      essential: true,
    });

    overlay.setProps({
      layers: buildSolarBarsLayers(stats, {
        lat: geocode.lat,
        lon: geocode.lon,
      }),
    });
  }, [resolved]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="map-overlay-legend">
        <div style={{ fontWeight: 600, marginBottom: 4 }}>3D bars</div>
        <div className="legend-row">
          <div
            className="legend-swatch"
            style={{ background: 'rgb(34,197,94)' }}
          />
          <span>CO₂ avoided by solar</span>
        </div>
        <div className="legend-row">
          <div
            className="legend-swatch"
            style={{ background: 'rgb(239,68,68)' }}
          />
          <span>CO₂ emitted by household</span>
        </div>
      </div>
    </div>
  );
}
