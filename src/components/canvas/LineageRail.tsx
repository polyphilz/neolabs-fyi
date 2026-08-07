import type { LineageGroup } from '../../data/types';
import type { LineageRail as Rail, LineageRailRow, YearAxis } from '../../lib/layout';
import { stable } from '../../lib/precision';

/**
 * Year columns for the lineage field.
 *
 * Categorical, not a continuous scale — the 2018–2020 gap is real but spending
 * a third of the canvas on three empty years buys nothing. Reading the columns
 * fill up to the right is the point: 18 labs in 2023, 20 in 2025, and 12 in
 * 2026 with most of the year still to run.
 */
export function LineageYearAxis({ axis }: { axis: YearAxis }) {
  return (
    <g className="year-axis" aria-hidden="true">
      {axis.columns.map((column, index) => (
        <g key={column.year} className={column.count === 0 ? 'year-column is-empty' : 'year-column'}>
          {index > 0 && (
            <line className="year-rule" x1={column.x0} y1={axis.top} x2={column.x0} y2={axis.bottom} />
          )}
          <text className="year-label" x={column.cx} y={axis.labelY} textAnchor="middle">
            {column.year}
          </text>
          <text className="year-count" x={column.cx} y={axis.labelY + 12} textAnchor="middle">
            {column.count}
          </text>
        </g>
      ))}
    </g>
  );
}

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
export function LineageRail({
  rail,
  activeGroup,
  pinnedGroup,
  overlap,
  onHover,
  onToggle,
}: Props) {
  const scale = (value: number) => stable((value / rail.maxTotal) * rail.barWidth);

  return (
    <g className={`lineage-rail${activeGroup ? ' has-active' : ''}`}>
      <text className="rail-kicker" x={rail.x} y={RAIL_KICKER_Y}>
        NEOLABS BY ORIGIN
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
          isMuted={Boolean(activeGroup && activeGroup !== row.id)}
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
}

/** Above the first row but below the floating header, which covers y < ~60. */
const RAIL_KICKER_Y = 68;
const BAR_H = 7;

function RailRow({
  row,
  rail,
  width,
  trackWidth,
  overlapWidth,
  overlapCount,
  isActive,
  isMuted,
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
  isMuted: boolean;
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

  return (
    <g
      className={
        'rail-row' +
        (isActive ? ' is-active' : '') +
        (isMuted ? ' is-muted' : '') +
        (isPinned ? ' is-pinned' : '') +
        (row.residual ? ' is-residual' : '') +
        (row.count === 0 ? ' is-empty' : '')
      }
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
      onPointerLeave={() => onHover(null)}
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

      <text className="rail-label" x={rail.x} y={row.y - 5}>
        {row.label}
      </text>
      <text className="rail-count" x={rail.x + rail.barWidth} y={row.y - 5} textAnchor="end">
        {showOverlap ? (
          <>
            <tspan className="rail-count-shared">{overlapCount}</tspan>
            <tspan className="rail-count-of"> of {row.count}</tspan>
          </>
        ) : (
          countLabel
        )}
      </text>

      {/* Track shows the unfiltered total, so filtering reads as a bar
          emptying rather than as an origin shrinking. */}
      <rect className="rail-track" x={rail.x} y={row.y + 3} width={trackWidth} height={BAR_H} />
      <rect className="rail-bar" x={rail.x} y={row.y + 3} width={width} height={BAR_H} />
      {showOverlap && (
        <rect className="rail-overlap" x={rail.x} y={row.y + 3} width={overlapWidth} height={BAR_H} />
      )}
    </g>
  );
}

/**
 * A worked example rather than a definition. "Lineage" is not a word that
 * survives being defined in a caption — one real founder moving from one real
 * place to another explains it in a sentence, and the fine print underneath
 * only has to cover the rules that would otherwise read as bugs.
 */
function Caption({ rail }: { rail: Rail }) {
  const { x, y, total } = rail.caption;
  const fine = [
    'Origin is a founder’s affiliation when the lab was',
    'founded. Investors and corporate parents are excluded.',
    'Most founding teams come from several places, so a lab',
    'appears under each — which is why the counts above',
    `add up to more than the ${total} labs on the map.`,
  ];

  return (
    <g className="rail-caption" aria-hidden="true">
      <text className="rail-caption-lead" x={x} y={y}>
        <tspan x={x} dy={0}>
          <tspan className="rail-caption-em">Mira Murati</tspan> was CTO of{' '}
          <tspan className="rail-caption-em">OpenAI</tspan>. In 2025
        </tspan>
        <tspan x={x} dy={13}>
          she founded <tspan className="rail-caption-em">Thinking Machines Lab</tspan>.
        </tspan>
        <tspan x={x} dy={13}>
          That’s one line on this map.
        </tspan>
      </text>
      <text className="rail-caption-fine" x={x} y={y + 44}>
        {fine.map((line, index) => (
          <tspan key={line} x={x} dy={index === 0 ? 0 : 11}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
