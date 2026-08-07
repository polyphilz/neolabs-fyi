/**
 * Soft hexagons, drawn from the same circumradius the packing simulation hands
 * us so nothing about the layout has to change.
 *
 * Flat-top orientation (vertices left and right, flat edges top and bottom):
 * it's the widest one through the middle, which is where labels live.
 *
 *        _______
 *       /       \
 *      <         >   width = 2r, height = √3·r
 *       \_______/
 *
 * Drawn dead-on at the packing radius, a settled cluster reads as machined
 * honeycomb: identical orientation, identical gaps. `hexJitter` breaks that up
 * — see the note there.
 */

/**
 * Corner radius, in canvas units — near enough to CSS pixels at the default
 * viewBox. Absolute rather than a fraction of the radius on purpose: scaling it
 * with the hexagon gives the big labs pillowy corners and the small ones sharp
 * ones, when what makes the set feel like one family is the corner staying put
 * while the shape grows.
 *
 * Clamped per hexagon by HEX_CORNER_CAP: at half the edge length the straight
 * sections vanish entirely and the smallest labs render as plain circles, which
 * loses the shape exactly where the label has already dropped out and the
 * silhouette is all the mark has left.
 */
export const HEX_CORNER = 6;

/** Ceiling on the corner, as a fraction of the circumradius. */
export const HEX_CORNER_CAP = 0.32;

/** Per-lab wobble on the corner, in the same units. Enough to keep it from
 *  looking die-cut, not enough to read as a different shape. */
export const HEX_CORNER_JITTER = 1.5;

/** √3 / 2 — half the hexagon's height, as a fraction of the circumradius. */
export const HEX_HALF_H = Math.sqrt(3) / 2;

const ANGLES = [0, 60, 120, 180, 240, 300].map((deg) => (deg * Math.PI) / 180);

/** Six vertices of a flat-top hexagon, rotated by `rot` radians. */
function vertices(r: number, rot: number): Array<readonly [number, number]> {
  return ANGLES.map((a) => [Math.cos(a + rot) * r, Math.sin(a + rot) * r] as const);
}

/**
 * SVG path for a hexagon of circumradius `r`, centred on the origin, rotated by
 * `rot` radians, with corners rounded by `corner` canvas units. Corners are
 * quadratic curves through the vertex, which is close enough to a circular
 * fillet at this scale and much cheaper to write.
 */
export function hexPath(r: number, corner = HEX_CORNER, rot = 0): string {
  const pts = vertices(r, rot);
  // Every edge of a regular hexagon is exactly the circumradius long, so the
  // cap is read straight off r.
  const trim = Math.min(corner, r * HEX_CORNER_CAP);

  const toward = (from: readonly [number, number], to: readonly [number, number]) => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1;
    return [from[0] + (dx / len) * trim, from[1] + (dy / len) * trim] as const;
  };

  const at = (p: readonly [number, number]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;

  let d = '';
  for (let i = 0; i < 6; i++) {
    const v = pts[i];
    const entry = toward(v, pts[(i + 5) % 6]);
    const exit = toward(v, pts[(i + 1) % 6]);
    d += `${i === 0 ? 'M' : 'L'}${at(entry)}Q${at(v)} ${at(exit)}`;
  }
  return `${d}Z`;
}

/**
 * Half-width of the hexagon at vertical offset `y` from the centre. Returns 0
 * outside the shape — the label fitter uses it exactly where it used to use the
 * circle's chord.
 *
 * Unrotated this is a one-liner; with rotation it's the horizontal chord of a
 * convex polygon, so we walk the edges. The hexagon is symmetric about the
 * origin, so the narrower side governs a centred line of text.
 */
export function hexHalfWidth(y: number, r: number, rot = 0): number {
  const ay = Math.abs(y);
  if (rot === 0) {
    if (ay >= HEX_HALF_H * r) return 0;
    // The slanted edge runs from (r, 0) to (r/2, √3r/2): the shape sheds 1/√3
    // of width per unit of height.
    return r - ay / Math.sqrt(3);
  }

  const pts = vertices(r, rot);
  let left = 0;
  let right = 0;
  for (let i = 0; i < 6; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % 6];
    if (y0 === y1) continue;
    // Half-open interval, so a vertex isn't counted by both of its edges.
    const t = (y - y0) / (y1 - y0);
    if (t < 0 || t >= 1) continue;
    const x = x0 + (x1 - x0) * t;
    if (x < left) left = x;
    if (x > right) right = x;
  }
  return Math.min(-left, right);
}

/**
 * Per-lab variation, so a settled cluster looks grown rather than stamped.
 *
 * Keyed off the slug rather than a random number: the value has to be identical
 * on the server and on the client, and it has to survive re-renders — a bubble
 * that reshuffles its own rotation every simulation tick would shimmer.
 *
 * Two knobs, both deliberately small. Rotation is the one that does the visible
 * work; scale mostly varies the *gaps*, which is what made the spacing read as
 * uniform in the first place, since collision leaves every neighbour pair the
 * same distance apart.
 */
export const HEX_ROT_SPREAD = (16 * Math.PI) / 180;
export const HEX_SCALE_MIN = 0.9;
export const HEX_SCALE_MAX = 1;

export interface HexJitter {
  /** Radians. */
  rot: number;
  /** Multiplier on the packing radius. */
  scale: number;
  /** Corner radius in canvas units. */
  corner: number;
}

const jitterCache = new Map<string, HexJitter>();

/** FNV-1a, for a stable spread of bits out of a slug. */
function hash(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function hexJitter(slug: string): HexJitter {
  const hit = jitterCache.get(slug);
  if (hit) return hit;

  const h = hash(slug);
  // Three independent-enough streams out of one hash.
  const a = (h & 0x3ff) / 0x3ff;
  const b = ((h >>> 10) & 0x3ff) / 0x3ff;
  const c = ((h >>> 20) & 0x3ff) / 0x3ff;

  const jitter: HexJitter = {
    rot: (a - 0.5) * 2 * HEX_ROT_SPREAD,
    scale: HEX_SCALE_MIN + b * (HEX_SCALE_MAX - HEX_SCALE_MIN),
    // A hair of variance in softness too, so equal-sized neighbours don't look
    // like the same shape twice. A pixel or two, no more.
    corner: HEX_CORNER + (c - 0.5) * 2 * HEX_CORNER_JITTER,
  };
  jitterCache.set(slug, jitter);
  return jitter;
}
