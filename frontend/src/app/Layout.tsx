import { useState } from 'react';
import { MapView } from '../features/map/MapView';
import { HouseholdForm } from '../features/input-form/HouseholdForm';
import { StatsPanel } from '../features/stats/StatsPanel';

export function Layout() {
  const [statsOpen, setStatsOpen] = useState(true);

  return (
    <div className="layout">
      <div className="map-pane">
        <MapView />
      </div>
      <div className="sky-gradient" aria-hidden="true" />
      <div className="form-pane floating-panel floating-panel-left">
        <HouseholdForm />
      </div>
      <div
        className={`stats-pane floating-panel floating-panel-right ${
          statsOpen ? '' : 'collapsed'
        }`}
      >
        <StatsPanel />
      </div>
      <button
        type="button"
        className={`stats-toggle ${statsOpen ? 'open' : 'closed'}`}
        aria-label={statsOpen ? 'Collapse impact panel' : 'Open impact panel'}
        aria-expanded={statsOpen}
        onClick={() => setStatsOpen((v) => !v)}
      >
        <span className="stats-toggle-chevron">{statsOpen ? '›' : '‹'}</span>
        {!statsOpen && <span className="stats-toggle-label">Impact</span>}
      </button>
    </div>
  );
}
