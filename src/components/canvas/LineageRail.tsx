import { memo, useLayoutEffect, useRef } from 'react';

import type { LineageGroup } from '../../data/types';
import type { LineageRail as Rail, LineageRailRow, YearAxis } from '../../lib/layout';
import { stable } from '../../lib/precision';

/**
 * Year columns for the lineage field.
 *
 * Categorical, not a continuous scale. The three sparse launches from
 * 2015–2018 form one labeled cohort; reading the later columns fill up to the
 * right is the point.
 */
export const LineageYearAxis = memo(function LineageYearAxis({ axis }: { axis: YearAxis }) {
  return (
    <g className="year-axis" aria-hidden="true">
      {axis.columns.map((column, index) => (
        <g key={column.id} className={column.count === 0 ? 'year-column is-empty' : 'year-column'}>
          {index > 0 && (
            <line className="year-rule" x1={column.x0} y1={axis.top} x2={column.x0} y2={axis.bottom} />
          )}
          <text className="year-label" x={column.cx} y={axis.labelY} textAnchor="middle">
            {column.label}
          </text>
          <text className="year-count" x={column.cx} y={axis.labelY + 12} textAnchor="middle">
            {column.count}
          </text>
        </g>
      ))}
    </g>
  );
});

interface Props {
  rail: Rail;
  /** Origin under the pointer, or pinned. Drives every highlight on the canvas. */
  activeGroup: LineageGroup | null;
  pinnedGroup: LineageGroup | null;
  /**
   * When an origin is active, how many of its labs each *other* origin also
   * claims. Drawn as a bright segment inside that row's bar, so the overlap is
   * readable as a proportion without tracing a single edge.
   */
  overlap: Map<LineageGroup, number>;
  onHover: (group: LineageGroup | null) => void;
  onToggle: (group: LineageGroup) => void;
}

/**
 * The ranked origin column.
 *
 * Sorted by how many neolabs came out of each place, which is the question the
 * lineage view exists to answer — so it is a legend, a ranking, a filter and
 * the left-hand anchor for direction, all in one element.
 */
export const LineageRail = memo(function LineageRail({
  rail,
  activeGroup,
  pinnedGroup,
  overlap,
  onHover,
  onToggle,
}: Props) {
  const scale = (value: number) => stable((value / rail.maxTotal) * rail.barWidth);

  return (
    <g
      className="lineage-rail"
      onPointerLeave={() => onHover(null)}
    >
      <text className="rail-kicker" x={rail.x} y={RAIL_KICKER_Y}>
        NEOLABS BY ORIGIN
      </text>
      <text className="rail-hint" x={rail.x} y={RAIL_HINT_Y}>
        Click to pin
      </text>

      {rail.rows.map((row) => (
        <RailRow
          key={row.id}
          row={row}
          rail={rail}
          width={scale(row.count)}
          trackWidth={scale(row.total)}
          overlapWidth={scale(Math.min(overlap.get(row.id) ?? 0, row.count))}
          overlapCount={overlap.get(row.id) ?? 0}
          isActive={activeGroup === row.id}
          isPinned={pinnedGroup === row.id}
          onHover={onHover}
          onToggle={onToggle}
        />
      ))}

      {/* Separates single institutions from the long-tail buckets. Without it
          "Startups" outranks Google and the chart answers with a shrug. */}
      <g className="rail-divider" aria-hidden="true">
        {/* Note sits above the rule: below it there is only enough room before
            the first residual row's label to collide with it. */}
        <text className="rail-divider-note" x={rail.x} y={rail.dividerY - 6}>
          Long-tail buckets, not single origins
        </text>
        <line x1={rail.x} y1={rail.dividerY} x2={rail.x + rail.barWidth} y2={rail.dividerY} />
      </g>

      <Caption rail={rail} />
    </g>
  );
});

/** Above the first row but below the floating header, which covers y < ~60. */
const RAIL_KICKER_Y = 62.5;
const RAIL_HINT_Y = 73.5;
const BAR_H = 7;

function RailRow({
  row,
  rail,
  width,
  trackWidth,
  overlapWidth,
  overlapCount,
  isActive,
  isPinned,
  onHover,
  onToggle,
}: {
  row: LineageRailRow;
  rail: Rail;
  width: number;
  trackWidth: number;
  overlapWidth: number;
  overlapCount: number;
  isActive: boolean;
  isPinned: boolean;
  onHover: (group: LineageGroup | null) => void;
  onToggle: (group: LineageGroup) => void;
}) {
  const filtered = row.count !== row.total;
  const countLabel = filtered ? `${row.count}/${row.total}` : String(row.total);
  const description = filtered
    ? `${row.count} of ${row.total} labs shown`
    : `${row.total} ${row.total === 1 ? 'lab' : 'labs'}`;
  // With another origin active, the count slot reports the overlap instead —
  // "13 of 22" is the actual finding, and it fits where a second label on the
  // bar would have collided with it.
  const showOverlap = overlapCount > 0 && !isActive;
  const labelRef = useRef<SVGTextElement>(null);
  const defaultCountRef = useRef<SVGTextElement>(null);
  const defaultLeaderRef = useRef<SVGLineElement>(null);
  const overlapLeaderRef = useRef<SVGLineElement>(null);

  useLayoutEffect(() => {
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const label = labelRef.current;
      const count = defaultCountRef.current;
      const defaultLeader = defaultLeaderRef.current;
      const overlapLeader = overlapLeaderRef.current;
      if (!label || !count || !defaultLeader || !overlapLeader) return;

      const labelBox = label.getBBox();
      const countBox = count.getBBox();
      const start = labelBox.x + labelBox.width + 6;
      const defaultEnd = countBox.x - 6;
      // The overlap form can be as wide as "20 of 51". Reserve that space so
      // its changing value never requires another measurement during hover.
      const overlapEnd = rail.x + rail.barWidth - 58;

      defaultLeader.setAttribute('x1', String(Math.min(start, defaultEnd)));
      defaultLeader.setAttribute('x2', String(defaultEnd));
      overlapLeader.setAttribute('x1', String(Math.min(start, overlapEnd)));
      overlapLeader.setAttribute('x2', String(overlapEnd));
    };

    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [countLabel, rail.barWidth, rail.x, row.label]);

  return (
    <g
      className={
        'rail-row' +
        (isPinned ? ' is-pinned' : '') +
        (showOverlap ? ' has-overlap' : '') +
        (row.residual ? ' is-residual' : '') +
        (row.count === 0 ? ' is-empty' : '')
      }
      data-lineage-row={row.id}
      role="button"
      tabIndex={0}
      aria-pressed={isPinned}
      aria-label={`${row.label}: ${description}. Click to pin.`}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => {
        event.stopPropagation();
        onToggle(row.id);
      }}
      onPointerEnter={() => onHover(row.id)}
      onFocus={() => onHover(row.id)}
      onBlur={() => onHover(null)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle(row.id);
        }
      }}
    >
      <title>{`${row.label}: ${description}`}</title>

      {/* Full-row hit target. The bar alone is 7 units tall, which is an
          unusable click target for the origins at the bottom of the ranking. */}
      <rect
        className="rail-row-hit"
        x={rail.x - 8}
        y={row.y - rail.rowPitch / 2}
        width={rail.barWidth + 60}
        height={rail.rowPitch}
      />

      <line
        ref={defaultLeaderRef}
        className="rail-leader rail-leader-default"
        y1={row.y - 9}
        y2={row.y - 9}
      />
      <line
        ref={overlapLeaderRef}
        className="rail-leader rail-leader-overlap"
        y1={row.y - 9}
        y2={row.y - 9}
      />
      <text ref={labelRef} className="rail-label" x={rail.x} y={row.y - 5}>
        {row.label}
      </text>
      {/* Both count variants stay mounted while focus moves between origins.
          Swapping a text node for tspans across every row caused needless SVG
          child-list churn on every pointer enter and leave. */}
      <text
        ref={defaultCountRef}
        className="rail-count rail-count-default"
        x={rail.x + rail.barWidth}
        y={row.y - 5}
        textAnchor="end"
      >
        {countLabel}
      </text>
      <text
        className="rail-count rail-count-overlap"
        x={rail.x + rail.barWidth}
        y={row.y - 5}
        textAnchor="end"
      >
        <tspan className="rail-count-shared">{overlapCount}</tspan>
        <tspan className="rail-count-of"> of {row.count}</tspan>
      </text>

      {/* Track shows the unfiltered total, so filtering reads as a bar
          emptying rather than as an origin shrinking. */}
      <rect className="rail-track" x={rail.x} y={row.y + 3} width={trackWidth} height={BAR_H} />
      <rect className="rail-bar" x={rail.x} y={row.y + 3} width={width} height={BAR_H} />
      <rect
        className="rail-overlap"
        x={rail.x}
        y={row.y + 3}
        width={overlapWidth}
        height={BAR_H}
      />
    </g>
  );
}

function Caption({ rail }: { rail: Rail }) {
  const { x, y, total } = rail.caption;
  const lines = [
    'Origins are founders’ affiliations at launch —',
    'not investors or corporate parents. A lab may',
    `have several, so totals exceed the ${total} shown.`,
  ];

  return (
    <g className="rail-caption" aria-hidden="true">
      <text className="rail-caption-copy" x={x} y={y}>
        {lines.map((line, index) => (
          <tspan key={line} x={x} dy={index === 0 ? 0 : 11}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
