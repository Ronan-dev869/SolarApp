
import { useHouseholdStore } from '../../lib/store/household';
import { useNeighborComparison } from '../../lib/api/bedrock_hook';


function formatNumber(n: number, digits = 0): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPct(n: number): string {
  if (n < 0.0001) return '<0.0001%';
  if (n < 0.01) return `${n.toFixed(4)}%`;
  if (n < 1) return `${n.toFixed(3)}%`;
  return `${n.toFixed(2)}%`;
}

export function StatsPanel() {
  const resolved = useHouseholdStore((s) => s.resolved);
  const error = useHouseholdStore((s) => s.error);
  const comparison = useNeighborComparison();

  if (error) {
    return (
      <div className="stats-pane">
        <h1>Impact</h1>
        <div className="stats-empty" style={{ color: 'var(--accent-warn)' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div>
        <h1>Impact</h1>
        <h2>County contribution</h2>
        <div className="stats-empty">
          Submit the form to see your household's impact.
        </div>
      </div>
    );
  }

  const { stats, solar, geocode } = resolved;

  return (
    <div>
      <h1>
        Impact
        <span className="confidence-badge">{solar.confidence}</span>
      </h1>
      <h2>
        {geocode.county} County · {solar.maxArrayPanelsCount} panel max
      </h2>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Solar generation</div>
          <div className="stat-value">
            {formatNumber(stats.annualGenerationKwh)}
            <span className="stat-unit">kWh / yr</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Consumption</div>
          <div className="stat-value">
            {formatNumber(stats.annualConsumptionKwh)}
            <span className="stat-unit">kWh / yr</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CO₂ avoided</div>
          <div className="stat-value">
            {formatNumber(stats.co2AvoidedKg)}
            <span className="stat-unit">kg / yr</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CO₂ emitted</div>
          <div className="stat-value">
            {formatNumber(stats.co2EmittedKg)}
            <span className="stat-unit">kg / yr</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">% of county solar</div>
          <div className="stat-pct green">
            {formatPct(stats.countySolarPctContribution)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">% of county CO₂</div>
          <div className="stat-pct red">
            {formatPct(stats.countyFootprintPctContribution)}
          </div>
        </div>
      </div>

      <div className="comparison-block">
        <button
          type="button"
          className="btn-compare"
          onClick={() => void comparison.run()}
          disabled={comparison.loading}
        >
          {comparison.loading ? 'Analyzing…' : 'Compare to neighbors'}
        </button>
        {comparison.error && (
          <div className="comparison-error">{comparison.error}</div>
        )}
        {comparison.result && (
          <p className="comparison-result">{comparison.result}</p>
        )}
      </div>
    </div>
  );
}
