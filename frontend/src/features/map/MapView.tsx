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

// Carto dark-matter — free, no API key, dark vector basemap.
const MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const resolved = useHouseholdStore((s) => s.resolved);
  const neighbors = useHouseholdStore((s) => s.neighbors);

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

      // Find the basemap's vector source so we can extrude its building layer.
      const style = map.getStyle();
      const vectorSourceName = Object.entries(style.sources ?? {}).find(
        ([, src]) => (src as { type?: string }).type === 'vector',
      )?.[0];

      if (vectorSourceName && !map.getLayer('building-3d')) {
        map.addLayer({
          id: 'building-3d',
          type: 'fill-extrusion',
          source: vectorSourceName,
          'source-layer': 'building',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#2e2418',
            'fill-extrusion-height': [
              'coalesce',
              ['get', 'render_height'],
              ['get', 'height'],
              3,
            ],
            'fill-extrusion-base': [
              'coalesce',
              ['get', 'render_min_height'],
              ['get', 'min_height'],
              0,
            ],
            'fill-extrusion-opacity': 0.85,
          },
        });
      }
    });

    map.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      void useHouseholdStore.getState().refreshAtLocation(lat, lng);
    });

    map.on('mousemove', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    return () => {
      overlayRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !resolved) return;
    const { geocode } = resolved;
    map.flyTo({
      center: [geocode.lon, geocode.lat],
      zoom: HOUSE_ZOOM,
      pitch: HOUSE_PITCH,
      bearing: 0,
      duration: 2200,
      essential: true,
    });
  }, [resolved]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !resolved) return;
    const { geocode, stats } = resolved;
    overlay.setProps({
      layers: buildSolarBarsLayers(
        stats,
        { lat: geocode.lat, lon: geocode.lon },
        neighbors,
      ),
    });
  }, [resolved, neighbors]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="map-overlay-legend">
        <div className="legend-title">At sunrise</div>
        <div className="legend-row">
          <div
            className="legend-swatch legend-swatch-solar"
            style={{ background: 'rgb(255,198,88)' }}
          />
          <span>Clean energy you generate</span>
        </div>
        <div className="legend-row">
          <div
            className="legend-swatch legend-swatch-co2"
            style={{ background: 'rgb(233,113,86)' }}
          />
          <span>CO₂ your home emits</span>
        </div>
      </div>
    </div>
  );
}
