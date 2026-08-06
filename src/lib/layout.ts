import { scalePoint } from 'd3-scale';

import { DOMAINS, DOMAIN_ORDER, LINEAGE_GROUPS, LINEAGE_ORDER, ORGS } from '../data/taxonomy';
import type { DomainId, Lab, LineageGroup } from '../data/types';
import type { Basemap } from './basemap';

/** Logical canvas space. Zoom/pan is a transform on top of this. */
export const VIEW_W = 1200;
export const VIEW_H = 680;

export type ViewId = 'valuation' | 'lineage' | 'geography' | 'area';

export const VIEWS: { id: ViewId; label: string; hint: string }[] = [
  { id: 'valuation', label: 'Valuation', hint: 'Bubble area is proportional to valuation.' },
  { id: 'lineage', label: 'Lineage', hint: 'Which lab each founding team came out of.' },
  { id: 'geography', label: 'Geography', hint: 'Where the labs actually are.' },
  { id: 'area', label: 'Research area', hint: 'Clustered by what they work on.' },
];

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

/** Non-node furniture a layout needs to draw: cluster headings, hubs, basemap. */
export interface Decorations {
  clusters?: {
    id: string;
    label: string;
    count: number;
    x: number;
    y: number;
    /** Fixed heading position. Derived from the grid, never from where the
        bubbles happen to settle, so a neighbour can't push it around. */
    labelY: number;
  }[];
  hubs?: { id: LineageGroup; label: string; x: number; y: number; count: number }[];
  edges?: { from: string; toHub: LineageGroup }[];
  basemap?: { land: string; graticule: string; transform: string };
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
   * Per-node containment. Where a layout groups nodes into cells, each node is
   * confined to its own cell so clusters cannot overlap each other or each
   * other's headings — at any canvas size, since the boxes come from the same
   * grid that positions the clusters.
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
// Valuation — a single centred pack, size carrying the whole story
// ---------------------------------------------------------------------------

function valuationLayout(labs: Lab[]): LayoutResult {
  // Everything targets the centre; collision does the packing. Year is handled
  // by the timeline filter rather than by position, so the view stays about
  // one thing: how absurdly different these numbers are.
  const centre = { x: VIEW_W / 2, y: VIEW_H / 2 };
  const targets = new Map<string, Vec>();
  for (const lab of labs) targets.set(lab.slug, centre);

  return {
    targets,
    decorations: {},
    collideStrength: 0.95,
    radiusScale: 1,
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
    hubPos.set(g, { x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry });
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
// Research area — labelled clusters in a fixed grid
// ---------------------------------------------------------------------------

function areaLayout(labs: Lab[]): LayoutResult {
  const present = DOMAIN_ORDER.filter((d) => labs.some((l) => l.domain === d));
  // Cap at four columns so clusters keep usable width; add rows instead.
  const cols = Math.min(4, present.length);
  const rows = Math.ceil(present.length / cols);

  const colScale = scalePoint<number>()
    .domain(Array.from({ length: cols }, (_, i) => i))
    .range([VIEW_W * 0.11, VIEW_W * 0.89]);
  const rowScale = scalePoint<number>()
    .domain(Array.from({ length: rows }, (_, i) => i))
    // Leaves headroom at the top for the floating HUD, which would otherwise
    // sit on the first row's cluster headings.
    .range([rows === 1 ? VIEW_H / 2 : VIEW_H * 0.31, rows === 1 ? VIEW_H / 2 : VIEW_H * 0.86]);

  // Cell size from the grid spacing, so everything below scales with the frame.
  const cellW = cols > 1 ? ((VIEW_W * 0.78) / (cols - 1)) * 0.94 : VIEW_W * 0.8;
  const cellH = rows > 1 ? ((VIEW_H * 0.55) / (rows - 1)) * 0.94 : VIEW_H * 0.7;
  /** Space above each cluster reserved for its two-line heading. */
  const HEADING = 42;

  const centre = new Map<DomainId, Vec>();
  present.forEach((d, i) => {
    centre.set(d, {
      x: colScale(i % cols) ?? VIEW_W / 2,
      y: rowScale(Math.floor(i / cols)) ?? VIEW_H / 2,
    });
  });

  const targets = new Map<string, Vec>();
  const nodeBounds = new Map<string, Box>();
  const counts = new Map<DomainId, number>();

  for (const lab of labs) {
    const c = centre.get(lab.domain);
    if (!c) continue;
    // Nodes sit below the reserved heading strip, centred in what remains.
    const y0 = c.y - cellH / 2 + HEADING;
    const y1 = c.y + cellH / 2;
    targets.set(lab.slug, { x: c.x, y: (y0 + y1) / 2 });
    nodeBounds.set(lab.slug, { x0: c.x - cellW / 2, y0, x1: c.x + cellW / 2, y1 });
    counts.set(lab.domain, (counts.get(lab.domain) ?? 0) + 1);
  }

  return {
    targets,
    nodeBounds,
    decorations: {
      clusters: present.map((d) => {
        const c = centre.get(d)!;
        return {
          id: d,
          label: DOMAINS[d].label,
          count: counts.get(d) ?? 0,
          x: c.x,
          y: c.y,
          labelY: c.y - cellH / 2 + 14,
        };
      }),
    },
    collideStrength: 1,
    radiusScale: 0.42,
    bounded: true,
  };
}

export function computeLayout(view: ViewId, labs: Lab[], basemap: Basemap): LayoutResult {
  switch (view) {
    case 'valuation':
      return valuationLayout(labs);
    case 'lineage':
      return lineageLayout(labs);
    case 'geography':
      return geographyLayout(labs, basemap);
    case 'area':
      return areaLayout(labs);
  }
}
