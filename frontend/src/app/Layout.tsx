import { MapView } from '../features/map/MapView';
import { HouseholdForm } from '../features/input-form/HouseholdForm';
import { StatsPanel } from '../features/stats/StatsPanel';

export function Layout() {
  return (
    <div className="layout">
      <div className="map-pane">
        <MapView />
      </div>
      <div className="form-pane">
        <HouseholdForm />
      </div>
      <div className="stats-pane">
        <StatsPanel />
      </div>
    </div>
  );
}
