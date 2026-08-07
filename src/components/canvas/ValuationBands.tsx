import type { ValuationBandAxis } from '../../lib/layout';

/**
 * The furniture behind the valuation view: a heading per magnitude band and a
 * dotted rule wherever two bands meet.
 *
 * Deliberately only rules and type — the bubbles are the chart, and boxing each
 * band would put a second, louder shape around marks that already read as a
 * group by position alone.
 */
export function ValuationBands({ axis }: { axis: ValuationBandAxis }) {
  return (
    <g className="valuation-bands" aria-hidden="true">
      {/* One divider per seam, so no rule is drawn down the outer edges. */}
      {axis.bands.slice(1).map((band) => (
        <line
          key={`divider-${band.id}`}
          className="valuation-band-divider"
          x1={band.x0}
          y1={axis.top}
          x2={band.x0}
          y2={axis.bottom}
        />
      ))}

      {axis.bands.map((band) => (
        <g key={band.id} className="valuation-band-label">
          <text className="valuation-band-title" textAnchor="middle" x={band.cx} y={axis.titleY}>
            {band.label}
          </text>
          <text className="valuation-band-count" textAnchor="middle" x={band.cx} y={axis.countY}>
            {band.count} {band.count === 1 ? 'LAB' : 'LABS'}
          </text>
        </g>
      ))}
    </g>
  );
}
