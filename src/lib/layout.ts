import { DOMAINS, DOMAIN_ORDER, LINEAGE_GROUPS, LINEAGE_ORDER, ORGS } from '../data/taxonomy';
import type { DomainId, Lab, LineageGroup } from '../data/types';
import type { Basemap } from './basemap';
import { stable } from './precision';

/** Logical canvas space. Zoom/pan is a transform on top of this. */
export const VIEW_W = 1200;
export const VIEW_H = 680;

/** Views the canvas knows how to draw — each one is a bubble layout. */
export type CanvasViewId = 'valuation' | 'lineage' | 'geography' | 'area';

/**
 * Every view of the dataset. The table reads the same filter state as the
 * canvas — that's the point of it being a view rather than a page — but it
 * isn't a layout, so it stays out of `CanvasViewId`.
 */
export type ViewId = CanvasViewId | 'table';

export const VIEWS: { id: ViewId; label: string; hint: string }[] = [
  {
    id: 'area',
    label: 'Research',
    hint: 'Primary fields around the bloom; newer labs sit farther from the centre.',
  },
  { id: 'lineage', label: 'Lineage', hint: 'Which lab each founding team came out of.' },
  { id: 'geography', label: 'Geography', hint: 'Where the labs actually are.' },
  {
    id: 'valuation',
    label: 'Valuation',
    hint: 'Bubble area is proportional to valuation, banded smallest to largest.',
  },
  { id: 'table', label: 'Table', hint: 'The same labs as a sortable table.' },
];

export const VIEW_IDS = VIEWS.map((v) => v.id);

export const isCanvasView = (view: ViewId): view is CanvasViewId => view !== 'table';

/**
 * Area-proportional sizing: radius scales with the square root of valuation, so
 * a $100B lab looks 300x a $335M lab in area — which is the actual ratio, and
 * the whole point of the view. A log scale would flatten exactly the disparity
 * this is meant to show.
 */
const RADIUS_K = 0.33;
const MIN_RADIUS = 5;

export function radiusFor(usdM: number, scale = 1): number {
  return Math.max(MIN_RADIUS * Math.max(scale, 0.7), RADIUS_K * scale * Math.sqrt(usdM));
}

/**
 * Bubble sizing is part of a view's argument, not merely its packing. The
 * valuation view preserves literal area ratios; categorical views compress
 * valuation into a bounded log-area scale so small labs remain legible without
 * allowing the largest labs to consume their geography, year, or field.
 */
export type BubbleSizing =
  | { kind: 'valuation'; scale: number }
  | {
      kind: 'log-area';
      minUsdM: number;
      maxUsdM: number;
      minRadius: number;
      maxRadius: number;
      unknownRadius: number;
    };

export type CategoricalSizeScale = 'log' | 'valuation';

const VALUATION_SIZING: BubbleSizing = { kind: 'valuation', scale: 1 };
const COMPACT_RADII = { minRadius: 6, maxRadius: 12, unknownRadius: 9 };
const ROOMY_COMPACT_RADII = { minRadius: 8, maxRadius: 16, unknownRadius: 12 };

/** A fixed full-dataset domain keeps filtering from resizing every survivor. */
function categoricalSizing(
  referenceLabs: Lab[],
  sizeScale: CategoricalSizeScale,
  radii: Pick<
    Extract<BubbleSizing, { kind: 'log-area' }>,
    'minRadius' | 'maxRadius' | 'unknownRadius'
  >
): BubbleSizing {
  if (sizeScale === 'valuation') return VALUATION_SIZING;
  const disclosed = referenceLabs
    .filter((lab) => lab.valuation.qualifier !== 'undisclosed' && !lab.structure)
    .map((lab) => lab.valuation.usdM);
  const minUsdM = disclosed.length ? Math.min(...disclosed) : 1;
  const maxUsdM = disclosed.length ? Math.max(...disclosed) : minUsdM;
  return {
    kind: 'log-area',
    minUsdM,
    maxUsdM,
    ...radii,
  };
}

export function radiusForLab(lab: Lab, sizing: BubbleSizing): number {
  if (sizing.kind === 'valuation') return radiusFor(lab.valuation.usdM, sizing.scale);
  if (lab.valuation.qualifier === 'undisclosed' || lab.structure) {
    return sizing.unknownRadius;
  }

  const logMin = Math.log(Math.max(sizing.minUsdM, Number.EPSILON));
  const logMax = Math.log(Math.max(sizing.maxUsdM, Number.EPSILON));
  const span = logMax - logMin;
  const position = span
    ? (Math.log(Math.max(lab.valuation.usdM, Number.EPSILON)) - logMin) / span
    : 0.5;
  const t = Math.max(0, Math.min(1, position));
  const minArea = sizing.minRadius ** 2;
  const maxArea = sizing.maxRadius ** 2;
  return Math.sqrt(minArea + t * (maxArea - minArea));
}

export interface Vec {
  x: number;
  y: number;
}

/** Non-node furniture a layout needs to draw: the area atlas, rail, or basemap. */
export interface Decorations {
  areaAtlas?: AreaAtlas;
  lineageRail?: LineageRail;
  edges?: { from: string; toGroup: LineageGroup }[];
  yearAxis?: YearAxis;
  basemap?: { land: string; graticule: string; transform: string };
  valuationBands?: ValuationBandAxis;
}

export interface LineageRailRow {
  id: LineageGroup;
  label: string;
  /** Labs currently shown that came out of here. */
  count: number;
  /** Labs in the whole dataset. Fixes the row order and sizes the bar track. */
  total: number;
  y: number;
  residual: boolean;
}

/**
 * The ranked origin column.
 *
 * Bar length is the number of neolabs a place has produced, which is the whole
 * point of the view: it is the only thing on the canvas sorted by the quantity
 * a reader came here to compare. Everything else — the field, the edges — hangs
 * off it.
 */
export interface LineageRail {
  /** Left edge of the labels and bar tracks. */
  x: number;
  /** Width of the largest bar, i.e. the full scale. */
  barWidth: number;
  /** Where edges leave the rail. Fixed, so the departures line up. */
  anchorX: number;
  rowPitch: number;
  maxTotal: number;
  /** Midpoint of the gap between the named origins and the residual buckets. */
  dividerY: number;
  rows: LineageRailRow[];
  caption: { x: number; y: number; total: number };
}

/** Year columns for the lineage field. Categorical, not a continuous scale. */
export interface YearAxis {
  columns: { id: string; label: string; x0: number; x1: number; cx: number; count: number }[];
  labelY: number;
  top: number;
  bottom: number;
}

/** One column of the valuation view: a magnitude range and the space it owns. */
export interface ValuationBand {
  id: string;
  label: string;
  count: number;
  x0: number;
  x1: number;
  cx: number;
}

export interface ValuationBandAxis {
  bands: ValuationBand[];
  /** Vertical extent of the dividers. */
  top: number;
  bottom: number;
  titleY: number;
  countY: number;
}

export interface AreaSector {
  id: DomainId;
  label: string;
  count: number;
  total: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

export interface AreaAtlas {
  cx: number;
  cy: number;
  /** The bloom is deliberately elliptical so it uses the landscape canvas. */
  xScale: number;
  innerRadius: number;
  outerRadius: number;
  nodeInnerRadius: number;
  nodeOuterRadius: number;
  labelRadius: number;
  minYear: number;
  maxYear: number;
  rings: { year: number; radius: number }[];
  sectors: AreaSector[];
}

/** Axis-aligned box a node may not leave. */
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface LayoutResult {
  targets: Map<string, Vec>;
  /**
   * Optional per-node containment. Layouts with strict cells can keep a mark
   * inside its own region rather than only inside the canvas.
   */
  nodeBounds?: Map<string, Box>;
  decorations: Decorations;
  /** Some layouts want collision relaxation; the map view mostly doesn't. */
  collideStrength: number;
  /** Extra breathing room around collision circles. Defaults to 2 units. */
  collisionPadding?: number;
  /** How this view turns a lab's valuation into a collision/drawing radius. */
  sizing: BubbleSizing;
  /** Pull toward the data position. Area view is firmer so year remains legible. */
  targetStrength?: number;
  /** Maximum collision displacement from a data position, in canvas units. */
  maxTargetDisplacement?: number;
  /** Optional elliptical annulus that must contain each circle in full. */
  radialBounds?: {
    cx: number;
    cy: number;
    xScale: number;
    innerRadius: number;
    outerRadius: number;
    padding: number;
  };
  /** Per-node wedge edges for the research bloom. */
  sectorBounds?: Map<
    string,
    {
      cx: number;
      cy: number;
      xScale: number;
      startAngle: number;
      endAngle: number;
      padding: number;
    }
  >;
  /** Whether to keep nodes inside the frame. Off for nothing, currently. */
  bounded: boolean;
}

/** Distinct lineage hubs a lab's founding team came from. */
export function lineageGroupsOf(lab: Lab): LineageGroup[] {
  const groups = new Set<LineageGroup>();
  for (const f of lab.founders) {
    if (f.isBacker) continue;
    for (const org of f.prior ?? []) groups.add(ORGS[org].group);
  }
  return groups.size ? [...groups] : ['startup'];
}

// ---------------------------------------------------------------------------
// Valuation — magnitude bands, smallest to largest, left to right
// ---------------------------------------------------------------------------

/**
 * Fixed bands, low to high. Round thresholds rather than quantiles, so a band
 * means the same thing whatever the filters are doing — and on this dataset
 * they happen to split cleanly into four comparable groups (18/25/20/8), with
 * the handful of genuine giants isolated in their own column.
 */
const VALUATION_BANDS: { id: string; label: string; min: number }[] = [
  { id: 'under-1b', label: 'Under $1B', min: 0 },
  { id: '1-3b', label: '$1B–$3B', min: 1_000 },
  { id: '3-10b', label: '$3B–$10B', min: 3_000 },
  { id: 'over-10b', label: 'Over $10B', min: 10_000 },
];

/**
 * Vertical extent of the band dividers. Kept close around the clumps: rules
 * running the full height of the canvas would be mostly empty, since even the
 * heaviest band packs into well under half of it.
 */
const BAND_TOP = 196;
const BAND_BOTTOM = 580;
/** Canvas edge to the outermost column. */
const BAND_MARGIN = 44;
/** Breathing room between a clump and the dotted rules on either side of it. */
const BAND_GUTTER = 54;
/** Enough width for the heading of a band holding only tiny bubbles. */
const BAND_MIN_WIDTH = 116;
/**
 * Fraction of a square a force-packed clump of circles actually fills. Used to
 * turn a band's total bubble area into the width its column needs.
 */
const BAND_PACKING = 0.68;
/**
 * How much of its own width a clump uses to spread targets left to right.
 * Well under 1: collision then widens the clump on its own, and a wider spread
 * than this pulls the pack apart into a row of separate dots.
 */
const BAND_SPREAD = 0.6;
/**
 * Firmer than the default pull. Every target in a band sits on one short line,
 * so the pull is what packs the clump — and the small bubbles, which barely
 * touch anything, otherwise stall wherever the previous view left them before
 * the simulation cools.
 */
const BAND_TARGET_STRENGTH = 0.4;

function valuationLayout(labs: Lab[]): LayoutResult {
  // Sorting inside each band and spreading targets across the column gives a
  // left-to-right size gradient; collision then packs the column vertically.
  // The sort is deliberately soft — the band a lab lands in is the claim, its
  // exact neighbour order is not.
  const present = VALUATION_BANDS.map((band, index) => {
    const max = VALUATION_BANDS[index + 1]?.min ?? Infinity;
    return {
      band,
      members: labs
        .filter((lab) => lab.valuation.usdM >= band.min && lab.valuation.usdM < max)
        .sort((a, b) => a.valuation.usdM - b.valuation.usdM || a.slug.localeCompare(b.slug)),
    };
  }).filter((entry) => entry.members.length > 0);

  const targets = new Map<string, Vec>();
  const nodeBounds = new Map<string, Box>();
  if (!present.length) {
    return {
      targets,
      decorations: {},
      collideStrength: 0.92,
      sizing: VALUATION_SIZING,
      bounded: true,
    };
  }

  // A column is sized from the area of the bubbles it holds, not their count —
  // the same encoding as the bubbles themselves, one level up. That is what
  // makes the columns widen from left to right instead of fighting the sort.
  const sides = present.map(({ members }) => {
    const area = members.reduce((sum, lab) => sum + Math.PI * radiusFor(lab.valuation.usdM) ** 2, 0);
    const widest = Math.max(...members.map((lab) => radiusFor(lab.valuation.usdM))) * 2;
    const packed = Math.max(Math.sqrt(area / BAND_PACKING), widest);
    // A clump also has to hold the spread of its own targets plus the bubble on
    // each end. In the top band, where one lab is a third of the column wide,
    // that is the binding constraint and the square estimate alone is too tight.
    return Math.max(packed, packed * BAND_SPREAD + widest);
  });

  const usable = VIEW_W - BAND_MARGIN * 2;
  const natural = sides.map((side) => Math.max(side + BAND_GUTTER, BAND_MIN_WIDTH));
  const naturalTotal = natural.reduce((sum, width) => sum + width, 0);
  // Slack is shared out evenly rather than proportionally: extra room is
  // margin, and margin should look the same in every column.
  const widths =
    naturalTotal <= usable
      ? natural.map((width) => width + (usable - naturalTotal) / natural.length)
      : natural.map((width) => (width * usable) / naturalTotal);

  const centreY = (BAND_TOP + BAND_BOTTOM) / 2;
  const bands: ValuationBand[] = [];
  let cursor = BAND_MARGIN;

  present.forEach(({ band, members }, index) => {
    const x0 = stable(cursor);
    const x1 = stable(cursor + widths[index]);
    cursor += widths[index];
    const cx = stable((x0 + x1) / 2);
    const spread = Math.max(0, Math.min(sides[index] * BAND_SPREAD, x1 - x0 - 24));

    // Rank-spaced targets put the band's biggest bubbles — which need the most
    // room — on the right, so collision presses the whole clump against the
    // right-hand rule. Rebalancing the line about its centre of area cancels
    // that lean without touching the order.
    const offsets = members.map((_, position) =>
      members.length === 1 ? 0 : (position / (members.length - 1) - 0.5) * spread
    );
    const weights = members.map((lab) => radiusFor(lab.valuation.usdM) ** 2);
    const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
    const lean = offsets.reduce((sum, offset, i) => sum + offset * weights[i], 0) / weightTotal;

    members.forEach((lab, position) => {
      targets.set(lab.slug, { x: stable(cx + offsets[position] - lean), y: centreY });
      // Hard cell per band: without it, collision pressure in a crowded column
      // shoves bubbles across a divider and the bands stop being true.
      nodeBounds.set(lab.slug, { x0, y0: BAND_TOP, x1, y1: BAND_BOTTOM });
    });

    bands.push({ id: band.id, label: band.label, count: members.length, x0, x1, cx });
  });

  return {
    targets,
    nodeBounds,
    decorations: {
      valuationBands: {
        bands,
        top: BAND_TOP,
        bottom: BAND_BOTTOM,
        titleY: BAND_TOP - 36,
        countY: BAND_TOP - 21,
      },
    },
    collideStrength: 0.92,
    sizing: VALUATION_SIZING,
    targetStrength: BAND_TARGET_STRENGTH,
    bounded: true,
  };
}

// ---------------------------------------------------------------------------
// Lineage — a ranked origin rail on the left, labs in year columns to the right
// ---------------------------------------------------------------------------

/** Left edge of the rail's labels and bar tracks. */
const RAIL_X = 26;
const RAIL_BAR_W = 194;
/** Where every edge leaves the rail. Fixed, so the departures read as a column
 * rather than a ragged set of tangents off the ends of the bars. */
const RAIL_ANCHOR_X = 248;
/** Clear of the floating header, which overlaps the top of the canvas. */
const RAIL_TOP = 86;
/** Rows stop here; the caption owns the rest of the column. Set so the bottom
 * band (caption and year labels) lands near the foot of the 680-unit view —
 * the viewBox is fixed and centred, so leaving slack here floats the whole
 * lineage layout upward instead of widening the bottom margin. */
const RAIL_BOTTOM = 580;
/** Space for the rule dividing named origins from the residual buckets, and
 * for the note that sits above it. */
const RAIL_DIVIDER_GAP = 26;
/** Bias the divider toward the residual rows: the note needs breathing room
 * after the final named-origin bar while still reading as a heading for the
 * long-tail section below it. */
const RAIL_DIVIDER_BIAS = 6;
const RAIL_CAPTION_Y = 606;

const FIELD_X0 = 300;
const FIELD_X1 = 1168;
const FIELD_TOP = 58;
/** Ends level with the rail's last row, so the two halves of the view share a
 * floor instead of the field running 56 units past it. */
const FIELD_BOTTOM = RAIL_BOTTOM;
/** Same baseline as the caption's first line: the year labels and the note
 * beneath the rail read as one band across the bottom of the view. */
const YEAR_LABEL_Y = RAIL_CAPTION_Y;
/** Sparse launch years before the current wave share one explicit cohort. */
const EARLY_COHORT_START = 2015;
const EARLY_COHORT_END = 2018;

/**
 * Lineage.
 *
 * Two encodings, and neither is bubble position in the old sense. The rail on
 * the left ranks origins by how many neolabs came out of them — the question
 * the view exists to answer. The field on the right is a categorical year axis,
 * so the acceleration is visible as the columns getting fuller to the right.
 *
 * A lab is deliberately NOT assigned to one origin. Most founding teams (56 of
 * 71) came out of several places at once, so every lab keeps an edge to each of
 * its origins and its vertical position is only a weak pull toward their mean.
 * Any rule that picked a single "primary" origin would be inventing a fact the
 * dataset does not contain.
 */
function lineageLayout(
  labs: Lab[],
  referenceLabs: Lab[],
  sizeScale: CategoricalSizeScale
): LayoutResult {
  const sizing = categoricalSizing(referenceLabs, sizeScale, ROOMY_COMPACT_RADII);
  // Row order follows the full dataset, so filtering thins the bars without
  // resorting the rail underneath the reader's cursor.
  const totals = new Map<LineageGroup, number>();
  const counts = new Map<LineageGroup, number>();
  for (const lab of referenceLabs) {
    for (const g of lineageGroupsOf(lab)) totals.set(g, (totals.get(g) ?? 0) + 1);
  }
  for (const lab of labs) {
    for (const g of lineageGroupsOf(lab)) counts.set(g, (counts.get(g) ?? 0) + 1);
  }

  // Residual buckets are forced below the rule however large they are. They
  // hold more labs than any single origin does, and ranking a 59-company
  // catch-all above Google would answer the reader's question with a shrug.
  const ordered = [...LINEAGE_ORDER].sort((a, b) => {
    const residual = Number(LINEAGE_GROUPS[a].residual ?? false) - Number(LINEAGE_GROUPS[b].residual ?? false);
    if (residual) return residual;
    return (totals.get(b) ?? 0) - (totals.get(a) ?? 0) || a.localeCompare(b);
  });

  const firstResidual = ordered.findIndex((g) => LINEAGE_GROUPS[g].residual);
  const rowPitch = (RAIL_BOTTOM - RAIL_TOP - RAIL_DIVIDER_GAP) / ordered.length;
  const rowY = (index: number) =>
    stable(RAIL_TOP + rowPitch * (index + 0.5) + (index >= firstResidual ? RAIL_DIVIDER_GAP : 0));

  const rows: LineageRailRow[] = ordered.map((g, index) => ({
    id: g,
    label: LINEAGE_GROUPS[g].label,
    count: counts.get(g) ?? 0,
    total: totals.get(g) ?? 0,
    y: rowY(index),
    residual: Boolean(LINEAGE_GROUPS[g].residual),
  }));
  const rowById = new Map(rows.map((row) => [row.id, row]));

  // Year columns, from the full dataset so the axis holds still under the
  // timeline filter. Categorical rather than linear: sparse 2015–2018 launches
  // form one explicit early cohort, leaving more room for the recent surge.
  const presentYears = [...new Set(referenceLabs.map((lab) => lab.year))].sort((a, b) => a - b);
  const earlyYears = presentYears.filter(
    (year) => year >= EARLY_COHORT_START && year <= EARLY_COHORT_END
  );
  const yearGroups = [
    ...presentYears
      .filter((year) => year < EARLY_COHORT_START)
      .map((year) => ({ id: String(year), label: String(year), years: [year] })),
    ...(earlyYears.length
      ? [
          {
            id: `${EARLY_COHORT_START}-${EARLY_COHORT_END}`,
            label: `${EARLY_COHORT_START}–${String(EARLY_COHORT_END).slice(2)}`,
            years: earlyYears,
          },
        ]
      : []),
    ...presentYears
      .filter((year) => year > EARLY_COHORT_END)
      .map((year) => ({ id: String(year), label: String(year), years: [year] })),
  ];
  const columnW = yearGroups.length ? (FIELD_X1 - FIELD_X0) / yearGroups.length : 0;
  const columns = yearGroups.map((group, index) => {
    const x0 = stable(FIELD_X0 + columnW * index);
    return {
      id: group.id,
      label: group.label,
      years: group.years,
      x0,
      x1: stable(x0 + columnW),
      cx: stable(x0 + columnW / 2),
      count: labs.filter((lab) => group.years.includes(lab.year)).length,
    };
  });
  const columnByYear = new Map(
    columns.flatMap((column) => column.years.map((year) => [year, column] as const))
  );

  const targets = new Map<string, Vec>();
  const nodeBounds = new Map<string, Box>();
  const edges: { from: string; toGroup: LineageGroup }[] = [];

  for (const lab of labs) {
    const groups = lineageGroupsOf(lab);
    for (const g of groups) edges.push({ from: lab.slug, toGroup: g });

    const column = columnByYear.get(lab.year);
    if (!column) continue;

    // Weak vertical pull toward the mean of the rows this lab reaches. It is a
    // hint, not a claim — because the rail is sorted by count, vertically
    // adjacent rows are similarly-sized origins rather than related ones, so a
    // lab's mean y is not a meaningful category. The edges carry the truth;
    // this only stops the field from being arbitrary.
    const ys = groups.map((g) => rowById.get(g)?.y).filter((y): y is number => y !== undefined);
    const meanY = ys.length ? ys.reduce((sum, y) => sum + y, 0) / ys.length : (FIELD_TOP + FIELD_BOTTOM) / 2;
    const own = radiusForLab(lab, sizing);

    targets.set(lab.slug, {
      x: column.cx,
      y: stable(Math.max(FIELD_TOP + own, Math.min(FIELD_BOTTOM - own, meanY))),
    });
    // Hard cell per displayed year/cohort, the same device the valuation bands
    // use. Collision in a crowded column would otherwise push labs into the
    // neighbouring period and quietly falsify the axis.
    nodeBounds.set(lab.slug, { x0: column.x0, y0: FIELD_TOP, x1: column.x1, y1: FIELD_BOTTOM });
  }

  return {
    targets,
    nodeBounds,
    decorations: {
      lineageRail: {
        x: RAIL_X,
        barWidth: RAIL_BAR_W,
        anchorX: RAIL_ANCHOR_X,
        rowPitch,
        maxTotal: Math.max(1, ...rows.map((row) => row.total)),
        dividerY: stable(
          RAIL_TOP + rowPitch * firstResidual + RAIL_DIVIDER_GAP / 2 + RAIL_DIVIDER_BIAS
        ),
        rows,
        caption: { x: RAIL_X, y: RAIL_CAPTION_Y, total: referenceLabs.length },
      },
      yearAxis: { columns, labelY: YEAR_LABEL_Y, top: FIELD_TOP, bottom: FIELD_BOTTOM },
      edges,
    },
    collideStrength: 0.9,
    sizing,
    targetStrength: 0.22,
    bounded: true,
  };
}

// ---------------------------------------------------------------------------
// Geography — projected coordinates over the build-time basemap
// ---------------------------------------------------------------------------

function geographyLayout(
  labs: Lab[],
  basemap: Basemap,
  referenceLabs: Lab[],
  sizeScale: CategoricalSizeScale
): LayoutResult {
  const scale = Math.min(VIEW_W / basemap.width, (VIEW_H - 40) / basemap.height);
  const offsetX = (VIEW_W - basemap.width * scale) / 2;
  const offsetY = (VIEW_H - basemap.height * scale) / 2;

  /**
   * Many labs share one city coordinate. Pulling all of them toward that exact
   * point lets circle collision settle into a conspicuously regular lattice.
   * Give members of the same coordinate a small deterministic cloud instead.
   * The cloud is centred on the true point, and uses the full dataset so
   * filtering never reshuffles the survivors.
   */
  const clusters = new Map<string, Lab[]>();
  for (const lab of referenceLabs) {
    const key = `${lab.location.lat},${lab.location.lon}`;
    const cluster = clusters.get(key);
    if (cluster) cluster.push(lab);
    else clusters.set(key, [lab]);
  }

  const scatter = new Map<string, Vec>();
  for (const members of clusters.values()) {
    if (members.length === 1) {
      scatter.set(members[0].slug, { x: 0, y: 0 });
      continue;
    }

    // Large hubs need enough variation to break symmetry, but the offset must
    // remain much smaller than the cluster collision already creates.
    const radius = Math.min(16, 3 + Math.sqrt(members.length) * 1.8);
    const offsets = members.map((lab) => {
      const h = stableHash(lab.slug);
      const angle = ((h & 0xffff) / 0xffff) * Math.PI * 2;
      const distance = Math.sqrt(((h >>> 16) & 0xffff) / 0xffff) * radius;
      return {
        slug: lab.slug,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      };
    });
    const meanX = offsets.reduce((sum, offset) => sum + offset.x, 0) / offsets.length;
    const meanY = offsets.reduce((sum, offset) => sum + offset.y, 0) / offsets.length;
    for (const offset of offsets) {
      scatter.set(offset.slug, {
        x: stable(offset.x - meanX),
        y: stable(offset.y - meanY),
      });
    }
  }

  const targets = new Map<string, Vec>();
  for (const lab of labs) {
    const p = basemap.positions[lab.slug];
    if (!p) continue;
    const offset = scatter.get(lab.slug) ?? { x: 0, y: 0 };
    targets.set(lab.slug, {
      x: stable(offsetX + p.x * scale + offset.x),
      y: stable(offsetY + p.y * scale + offset.y),
    });
  }

  return {
    targets,
    decorations: {
      basemap: {
        land: basemap.land,
        graticule: basemap.graticule,
        transform: `translate(${offsetX},${offsetY}) scale(${scale})`,
      },
    },
    // Weak collision: nudge overlapping labs apart without lying about location.
    collideStrength: 0.4,
    // The drawn hexes already vary down to 90% of their packing radius. A
    // smaller pad lets those organic gaps show instead of enforcing a moat.
    collisionPadding: 0.35,
    sizing: categoricalSizing(referenceLabs, sizeScale, COMPACT_RADII),
    targetStrength: 0.2,
    bounded: true,
  };
}

/** FNV-1a: stable pseudo-random bits without hydration or reload jitter. */
function stableHash(key: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < key.length; index++) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// ---------------------------------------------------------------------------
// Research area — a chronological bloom
// ---------------------------------------------------------------------------

const AREA_COLLISION_PADDING = 2;

function areaLayout(
  labs: Lab[],
  referenceLabs: Lab[],
  sizeScale: CategoricalSizeScale
): LayoutResult {
  const sizing = categoricalSizing(referenceLabs, sizeScale, ROOMY_COMPACT_RADII);
  const cx = VIEW_W / 2;
  const cy = VIEW_H * 0.53;
  const xScale = 1.45;
  const innerRadius = 72;
  const outerRadius = 270;
  const nodeInnerRadius = 103;
  // Use the petal rather than reserving a large empty outer band. The
  // remaining 25 units accommodate the largest area-view bubbles and keep
  // their strokes inside the sector rim.
const nodeOuterRadius = 245;
  const labelRadius = 290;
  const gap = 0.032;
  const minimumSpan = 0.13;

  // Sector capacity follows the full dataset, not the filtered subset. This
  // keeps the atlas stable while the timeline or chips remove labs and makes
  // an empty field visible as absence rather than silently deleting it.
  const totals = new Map<DomainId, number>();
  const visibleCounts = new Map<DomainId, number>();
  for (const lab of referenceLabs) totals.set(lab.domain, (totals.get(lab.domain) ?? 0) + 1);
  for (const lab of labs) visibleCounts.set(lab.domain, (visibleCounts.get(lab.domain) ?? 0) + 1);

  // A sub-linear capacity scale leaves rare, emerging areas enough room to be
  // legible without letting the largest field consume the entire bloom.
  const weights = DOMAIN_ORDER.map((domain) => Math.pow(Math.max(1, totals.get(domain) ?? 0), 0.62));
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const available = Math.PI * 2 - gap * DOMAIN_ORDER.length;
  const flexible = available - minimumSpan * DOMAIN_ORDER.length;
  const spans = weights.map((weight) => minimumSpan + (flexible * weight) / weightTotal);

  // General-purpose models are the north petal. Keeping the starting angle
  // tied to its midpoint means filters never rotate the atlas.
  let cursor = -Math.PI / 2 - spans[0] / 2;
  const sectors: AreaSector[] = DOMAIN_ORDER.map((domain, index) => {
    const startAngle = cursor;
    const endAngle = startAngle + spans[index];
    cursor = endAngle + gap;
    return {
      id: domain,
      label: DOMAINS[domain].label,
      count: visibleCounts.get(domain) ?? 0,
      total: totals.get(domain) ?? 0,
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
    };
  });

  const years = referenceLabs.map((lab) => lab.year);
  const minYear = years.length ? Math.min(...years) : new Date().getFullYear();
  const maxYear = years.length ? Math.max(...years) : minYear;
  const radiusForYear = (year: number) => {
    if (minYear === maxYear) return (nodeInnerRadius + nodeOuterRadius) / 2;
    const t = Math.max(0, Math.min(1, (year - minYear) / (maxYear - minYear)));
    // Recent years hold most neolabs. Expanding that end of the scale gives
    // those dense cohorts room while preserving a monotonic time axis.
    return nodeInnerRadius + Math.pow(t, 1.65) * (nodeOuterRadius - nodeInnerRadius);
  };

  const targets = new Map<string, Vec>();
  const sectorBounds: NonNullable<LayoutResult['sectorBounds']> = new Map();
  for (const sector of sectors) {
    const referenceMembers = referenceLabs
      .filter((lab) => lab.domain === sector.id)
      .sort((a, b) => b.valuation.usdM - a.valuation.usdM || a.slug.localeCompare(b.slug));
    const angularPadding = Math.min(0.08, (sector.endAngle - sector.startAngle) * 0.14);
    const usableStart = sector.startAngle + angularPadding;
    const usableEnd = sector.endAngle - angularPadding;
    // Give every lab a stable lane across the petal, using the full dataset so
    // filters remove marks without making their neighbours jump sideways.
    // Score the lanes geometrically: valuation order still places the largest
    // marks first, but same-year peers cannot inherit adjacent targets merely
    // because their valuations happen to be far apart.
    const laneBySlug = collisionAwareAreaLanes(
      referenceMembers,
      usableStart,
      usableEnd,
      sector.startAngle,
      sector.endAngle,
      radiusForYear,
      sizing,
      xScale
    );
    const bounds = {
      cx,
      cy,
      xScale,
      startAngle: sector.startAngle,
      endAngle: sector.endAngle,
      padding: 3,
    };

    for (const lab of labs.filter((candidate) => candidate.domain === sector.id)) {
      const lane = laneBySlug.get(lab.slug) ?? 0.5;
      const angle = usableStart + lane * (usableEnd - usableStart);
      const radius = radiusForYear(lab.year);
      targets.set(lab.slug, {
        x: stable(cx + Math.cos(angle) * radius * xScale),
        y: stable(cy + Math.sin(angle) * radius),
      });
      sectorBounds.set(lab.slug, bounds);
    }
  }

  const rings = Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
    const year = minYear + index;
    return { year, radius: radiusForYear(year) };
  });

  return {
    targets,
    decorations: {
      areaAtlas: {
        cx,
        cy,
        xScale,
        innerRadius,
        outerRadius,
        nodeInnerRadius,
        nodeOuterRadius,
        labelRadius,
        minYear,
        maxYear,
        rings,
        sectors,
      },
    },
    collideStrength: 1,
    collisionPadding: AREA_COLLISION_PADDING,
    sizing,
    targetStrength: 0.38,
    maxTargetDisplacement: 18,
    radialBounds: { cx, cy, xScale, innerRadius, outerRadius, padding: 3 },
    sectorBounds,
    bounded: true,
  };
}

/**
 * Assign stable angular lanes while respecting the actual year radii and
 * bubble sizes. Candidate lanes come from a dense low-discrepancy sequence;
 * greedily maximizing the worst clearance keeps peers on the same year ring
 * from receiving overlapping targets. Edge clearance participates in the same
 * score, so solving a collision cannot simply push a large mark into a petal
 * boundary.
 */
function collisionAwareAreaLanes(
  members: Lab[],
  usableStart: number,
  usableEnd: number,
  sectorStart: number,
  sectorEnd: number,
  radiusForYear: (year: number) => number,
  sizing: BubbleSizing,
  xScale: number
): Map<string, number> {
  const candidates = progressiveLanes(Math.max(32, members.length * 4));
  const placed: { x: number; y: number; r: number }[] = [];
  const lanes = new Map<string, number>();
  const boundaryPadding = 3;
  const startX = Math.cos(sectorStart) * xScale;
  const startY = Math.sin(sectorStart);
  const endX = Math.cos(sectorEnd) * xScale;
  const endY = Math.sin(sectorEnd);
  const startLength = Math.hypot(startX, startY);
  const endLength = Math.hypot(endX, endY);

  for (const lab of members) {
    const r = radiusForLab(lab, sizing);
    const yearRadius = radiusForYear(lab.year);
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestCentreDistance = Number.POSITIVE_INFINITY;
    let bestPoint = { x: 0, y: 0 };

    for (let index = 0; index < candidates.length; index++) {
      const lane = candidates[index];
      const angle = usableStart + lane * (usableEnd - usableStart);
      const x = Math.cos(angle) * yearRadius * xScale;
      const y = Math.sin(angle) * yearRadius;
      const startClearance =
        (startX * y - startY * x) / startLength - r - boundaryPadding;
      const endClearance = (x * endY - y * endX) / endLength - r - boundaryPadding;
      let score = Math.min(startClearance, endClearance);

      for (const other of placed) {
        score = Math.min(
          score,
          Math.hypot(x - other.x, y - other.y) -
            r -
            other.r -
            AREA_COLLISION_PADDING * 2
        );
      }

      const centreDistance = Math.abs(lane - 0.5);
      if (
        score > bestScore + 1e-6 ||
        (Math.abs(score - bestScore) <= 1e-6 && centreDistance < bestCentreDistance)
      ) {
        bestIndex = index;
        bestScore = score;
        bestCentreDistance = centreDistance;
        bestPoint = { x, y };
      }
    }

    const [lane] = candidates.splice(bestIndex, 1);
    lanes.set(lab.slug, lane);
    placed.push({ ...bestPoint, r });
  }

  return lanes;
}

/**
 * Low-discrepancy candidates, ordered from the centre into the largest
 * remaining gaps.
 */
function progressiveLanes(count: number): number[] {
  if (count === 2) return [0.35, 0.65];
  const lanes: number[] = [];
  for (let denominator = 2; lanes.length < count; denominator *= 2) {
    for (let numerator = 1; numerator < denominator && lanes.length < count; numerator += 2) {
      lanes.push(numerator / denominator);
    }
  }
  return lanes;
}

export function computeLayout(
  view: CanvasViewId,
  labs: Lab[],
  basemap: Basemap,
  referenceLabs: Lab[] = labs,
  sizeScale: CategoricalSizeScale = 'log'
): LayoutResult {
  switch (view) {
    case 'valuation':
      return valuationLayout(labs);
    case 'lineage':
      return lineageLayout(labs, referenceLabs, sizeScale);
    case 'geography':
      return geographyLayout(labs, basemap, referenceLabs, sizeScale);
    case 'area':
      return areaLayout(labs, referenceLabs, sizeScale);
  }
}
