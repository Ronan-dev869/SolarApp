import type { ResolvedHousehold } from '../../lib/api/types';

interface ReceiptModalProps {
  resolved: ResolvedHousehold;
  onClose: () => void;
}

function fmt(n: number, digits = 0): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtPct(n: number): string {
  if (n < 0.0001) return '<0.0001%';
  if (n < 0.01) return `${n.toFixed(4)}%`;
  if (n < 1) return `${n.toFixed(3)}%`;
  return `${n.toFixed(2)}%`;
}

function pad(label: string, value: string, width = 32): string {
  const free = Math.max(1, width - label.length - value.length);
  return `${label}${' '.repeat(free)}${value}`;
}

export function ReceiptModal({ resolved, onClose }: ReceiptModalProps) {
  const { input, geocode, solar, stats } = resolved;
  const now = new Date();
  const timestamp = now.toLocaleString();
  const orderId = Math.floor(Math.random() * 900000 + 100000).toString();

  return (
    <div className="receipt-backdrop" onClick={onClose}>
      <div
        className="receipt-window"
        role="dialog"
        aria-label="Solar impact receipt"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="receipt-titlebar">
          <span>receipt.txt</span>
          <button
            type="button"
            className="receipt-close"
            onClick={onClose}
            aria-label="Close receipt"
          >
            ×
          </button>
        </div>

        <div className="receipt-body">
          <pre className="receipt-pre">
{`================================
      SOLAR IMPACT RECEIPT
================================
${pad('Order #', orderId)}
${pad('Date', timestamp)}
--------------------------------
         HOUSEHOLD
--------------------------------
Address:
  ${input.address}
${pad('County', geocode.county)}
${pad('Lat', geocode.lat.toFixed(5))}
${pad('Lon', geocode.lon.toFixed(5))}
${pad('Annual use', `${fmt(input.annualConsumptionKwh)} kWh`)}
${pad('Panels', `${input.panelCount}`)}
--------------------------------
         SOLAR POTENTIAL
--------------------------------
${pad('Generation', `${fmt(solar.annualGenerationKwh)} kWh`)}
${pad('Panel cap.', `${fmt(solar.panelCapacityWatts)} W`)}
${pad('Max panels', `${solar.maxArrayPanelsCount}`)}
${pad('Confidence', solar.confidence)}
${pad('CO2/MWh', `${fmt(solar.carbonOffsetFactorKgPerMwh)} kg`)}
--------------------------------
          IMPACT
--------------------------------
${pad('CO2 avoided', `${fmt(stats.co2AvoidedKg)} kg`)}
${pad('CO2 emitted', `${fmt(stats.co2EmittedKg)} kg`)}
${pad('Net CO2', `${fmt(stats.netCo2Kg)} kg`)}
${pad('% county solar', fmtPct(stats.countySolarPctContribution))}
${pad('% county CO2', fmtPct(stats.countyFootprintPctContribution))}
================================
    THANK YOU FOR GOING SOLAR
================================`}
          </pre>

          <div className="receipt-actions">
            <button
              type="button"
              className="receipt-btn"
              onClick={() => window.print()}
            >
              Print
            </button>
            <button
              type="button"
              className="receipt-btn receipt-btn-ghost"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
