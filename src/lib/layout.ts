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

/** Bubble scale for the lineage view, shared by the layout and the sim. */
export const LINEAGE_RADIUS_SCALE = 0.58;

export function radiusFor(usdM: number, scale = 1): number {
  return Math.max(MIN_RADIUS * Math.max(scale, 0.7), RADIUS_K * scale * Math.sqrt(usdM));
}

export interface Vec {
  x: number;
  y: number;
}

/** Non-node furniture a layout needs to draw: the area atlas, hubs, or basemap. */
export interface Decorations {
  areaAtlas?: AreaAtlas;
  hubs?: { id: LineageGroup; label: string; x: number; y: number; count: number }[];
  edges?: { from: string; toHub: LineageGroup }[];
  basemap?: { land: string; graticule: string; transform: string };
  valuationBands?: ValuationBandAxis;
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
  rings: { year: number; radius: number; major: boolean }[];
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
  /**
   * Per-view bubble scale. On the world map the bubbles have to compete with
   * real geography — at full size the Bay Area cluster swallows North America
   * and the position encoding stops meaning anything.
   */
  radiusScale: number;
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

/** No longer operating as itself. Derived, never stored, so it cannot drift
 * out of sync with `exit`. */
export function isDefunct(lab: Lab): boolean {
  return lab.exit?.absorbed === true;
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
    return { targets, decorations: {}, collideStrength: 0.92, radiusScale: 1, bounded: true };
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
    radiusScale: 1,
    targetStrength: BAND_TARGET_STRENGTH,
    bounded: true,
  };
}

// ---------------------------------------------------------------------------
// Lineage — hubs on an ellipse, labs pulled toward their parents
// ---------------------------------------------------------------------------

function lineageLayout(labs: Lab[]): LayoutResult {
  const cx = VIEW_W / 2;
  const cy = VIEW_H / 2;
  const rx = VIEW_W * 0.3;
  const ry = VIEW_H * 0.29;
  /** How far past its hub a single-parent lab sits, forming a visible satellite. */
  const ORBIT = 78;

  const present = LINEAGE_ORDER.filter((g) => labs.some((l) => lineageGroupsOf(l).includes(g)));
  const hubPos = new Map<LineageGroup, Vec>();
  present.forEach((g, i) => {
    // Start at -90deg so OpenAI sits at the top; the order is fixed so the
    // graph doesn't reshuffle itself every time a filter changes.
    const t = (i / present.length) * Math.PI * 2 - Math.PI / 2;
    hubPos.set(g, {
      x: stable(cx + Math.cos(t) * rx),
      y: stable(cy + Math.sin(t) * ry),
    });
  });

  const targets = new Map<string, Vec>();
  const edges: { from: string; toHub: LineageGroup }[] = [];
  const counts = new Map<LineageGroup, number>();

  for (const lab of labs) {
    const groups = lineageGroupsOf(lab).filter((g) => hubPos.has(g));
    if (!groups.length) continue;
    let sx = 0;
    let sy = 0;
    for (const g of groups) {
      const p = hubPos.get(g)!;
      sx += p.x;
      sy += p.y;
      edges.push({ from: lab.slug, toHub: g });
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    const mx = sx / groups.length;
    const my = sy / groups.length;

    // Single-parent labs orbit just outside their hub, so each hub reads as a
    // labelled constellation. Multi-parent labs stay at the midpoint of their
    // hubs, which lands them in the interior where their several edges are
    // visible — being between two lineages is the interesting thing about them.
    const dx = mx - cx;
    const dy = my - cy;
    const dist = Math.hypot(dx, dy) || 1;
    // Offset by the lab's own radius too, or a $100B satellite lands on top of
    // the hub it's supposed to be orbiting.
    const own = radiusFor(lab.valuation.usdM, LINEAGE_RADIUS_SCALE);
    const push = groups.length === 1 ? ORBIT + own : own * 0.5;
    targets.set(lab.slug, {
      x: mx + (dx / dist) * push,
      y: my + (dy / dist) * push,
    });
  }

  return {
    targets,
    decorations: {
      hubs: present.map((g) => ({
        id: g,
        label: LINEAGE_GROUPS[g].short,
        x: hubPos.get(g)!.x,
        y: hubPos.get(g)!.y,
        count: counts.get(g) ?? 0,
      })),
      edges,
    },
    collideStrength: 0.85,
    radiusScale: LINEAGE_RADIUS_SCALE,
    bounded: true,
  };
}

// ---------------------------------------------------------------------------
// Geography — projected coordinates over the build-time basemap
// ---------------------------------------------------------------------------

function geographyLayout(labs: Lab[], basemap: Basemap): LayoutResult {
  const scale = Math.min(VIEW_W / basemap.width, (VIEW_H - 40) / basemap.height);
  const offsetX = (VIEW_W - basemap.width * scale) / 2;
  const offsetY = (VIEW_H - basemap.height * scale) / 2;

  const targets = new Map<string, Vec>();
  for (const lab of labs) {
    const p = basemap.positions[lab.slug];
    if (!p) continue;
    targets.set(lab.slug, { x: offsetX + p.x * scale, y: offsetY + p.y * scale });
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
    radiusScale: 0.5,
    bounded: true,
  };
}

// ---------------------------------------------------------------------------
// Research area — a chronological bloom
// ---------------------------------------------------------------------------

function areaLayout(labs: Lab[], referenceLabs: Lab[]): LayoutResult {
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
  for (const sector of sectors) {
    const referenceMembers = referenceLabs
      .filter((lab) => lab.domain === sector.id)
      .sort((a, b) => b.valuation.usdM - a.valuation.usdM || a.slug.localeCompare(b.slug));
    const angularPadding = Math.min(0.08, (sector.endAngle - sector.startAngle) * 0.14);
    const usableStart = sector.startAngle + angularPadding;
    const usableEnd = sector.endAngle - angularPadding;
    // Give every lab a stable lane across the petal, using the full dataset so
    // filters remove marks without making their neighbours jump sideways. The
    // largest marks get the central lanes, where there is the most room.
    const slots = progressiveLanes(referenceMembers.length);
    const laneBySlug = new Map(referenceMembers.map((lab, index) => [lab.slug, slots[index]]));

    for (const lab of labs.filter((candidate) => candidate.domain === sector.id)) {
      const lane = laneBySlug.get(lab.slug) ?? 0.5;
      const angle = usableStart + lane * (usableEnd - usableStart);
      const radius = radiusForYear(lab.year);
      targets.set(lab.slug, {
        x: stable(cx + Math.cos(angle) * radius * xScale),
        y: stable(cy + Math.sin(angle) * radius),
      });
    }
  }

  const majorYears = new Set([minYear, maxYear, minYear + 4, maxYear - 3, maxYear - 1]);
  const rings = Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
    const year = minYear + index;
    return { year, radius: radiusForYear(year), major: majorYears.has(year) };
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
    radiusScale: 0.32,
    targetStrength: 0.38,
    maxTargetDisplacement: 18,
    radialBounds: { cx, cy, xScale, innerRadius, outerRadius, padding: 3 },
    bounded: true,
  };
}

/**
 * Low-discrepancy lanes: each new mark fills the largest remaining angular
 * gap. This matters because data order is valuation order — the few very large
 * circles get separated first, and tiny marks subsequently fill between them.
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
  referenceLabs: Lab[] = labs
): LayoutResult {
  switch (view) {
    case 'valuation':
      return valuationLayout(labs);
    case 'lineage':
      return lineageLayout(labs);
    case 'geography':
      return geographyLayout(labs, basemap);
    case 'area':
      return areaLayout(labs, referenceLabs);
  }
}
