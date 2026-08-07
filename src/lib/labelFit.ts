/**
 * Fitting a lab name inside a bubble.
 *
 * Two things make this more than a character count:
 *
 * 1. The usable width varies with height. The widest line belongs in the
 *    middle; lines above and below have progressively less room. So the check
 *    is per-line against the shape's width at that line's own offset, not
 *    against the full diameter.
 * 2. Wrapping buys a lot. "Thinking Machines" on one line needs a bubble nearly
 *    twice as wide as the same name split across two. Names are wrapped at word
 *    boundaries, and we take whichever line count yields the largest type.
 *
 * The shape is a flat-top hexagon (see lib/hex), which is narrower than the
 * circle it's inscribed in everywhere except the middle row — so the fit is
 * measured against the hexagon, not the packing radius.
 *
 * The result is in *canvas* units. Whether it's actually legible depends on the
 * zoom level, which the caller applies — that's what makes labels appear as you
 * zoom into a small bubble.
 */

import { HEX_HALF_H, hexHalfWidth } from './hex';

/** Memoised layouts, keyed by name + radius. Cleared when the font changes. */
const cache = new Map<string, FittedLabel | null>();

export interface FittedLabel {
  lines: string[];
  /** Canvas units. Multiply by the on-screen scale to get pixels. */
  fontSize: number;
  lineHeight: number;
}

/**
 * Fallback advance width per character, in ems, used only before the browser
 * can measure — during SSR and the first client render, where measuring would
 * desync the two. Errs generous: underestimating pushes glyphs past the
 * bubble's edge, which looks broken. Mono is a fixed 0.6em per glyph.
 */
const FALLBACK_CHAR_EM = 0.62;

/** Weight the bubble labels are drawn at; metrics must match. */
const LABEL_WEIGHT = 600;
/**
 * Fraction of the radius the type may occupy. Text that reaches the edge
 * technically fits but reads as overflowing, so this leaves a visible band of
 * clear space. Lowering it makes labels smaller and appear at deeper zoom —
 * that's the intended trade. Runs higher than the circle-era value because the
 * hexagon itself already pulls the boundary inwards.
 */
const INSET = 0.76;
export const LINE_SPACING = 1.12;
/** Canvas-unit ceiling, so a huge bubble doesn't shout. */
const MAX_FONT = 15;
const MAX_LINES = 3;

/**
 * A mark gets *less* of the hexagon than type does, which is the opposite of
 * what it seems like it should need. Type is mostly whitespace, so a line of it
 * set to the type inset still reads as sitting inside a margin; a solid mark at
 * the same inset reads as filling the hexagon edge to edge and dominates every
 * lettered neighbour. This matches their visual weight, not their bounding box.
 */
const MARK_INSET = 0.62;
/**
 * Canvas-unit ceiling on a mark's height, the counterpart to MAX_FONT. Runs
 * well above what a wide mark ever reaches, because it's a limit on *height*:
 * a tall narrow mark like a capital I hits it while still looking small, since
 * its width — the dimension the eye reads as size — is a third of that.
 */
const MAX_MARK = 28;

// --- text metrics -----------------------------------------------------------
// Real measurement rather than a per-character constant, because the constant
// has to be re-tuned for every typeface. Measuring means swapping fonts is a
// one-line change that can't silently break label fitting.

let measured = false;
let ctx: CanvasRenderingContext2D | null = null;
let fontSpec = '';
const emCache = new Map<string, number>();

function context(): CanvasRenderingContext2D | null {
  if (ctx || typeof document === 'undefined') return ctx;
  ctx = document.createElement('canvas').getContext('2d');
  return ctx;
}

/** Width of `line` in ems at the label weight. */
function widthEm(line: string): number {
  if (!measured) return line.length * FALLBACK_CHAR_EM;

  const hit = emCache.get(line);
  if (hit !== undefined) return hit;

  const c = context();
  if (!c) return line.length * FALLBACK_CHAR_EM;

  if (!fontSpec) {
    // Must match .bubble-label's family, or every fitted size is a lie.
    const family =
      getComputedStyle(document.documentElement).getPropertyValue('--font').trim() ||
      'ui-monospace, monospace';
    // Measured at 100px for precision, then normalised to ems.
    fontSpec = `${LABEL_WEIGHT} 100px ${family}`;
  }
  c.font = fontSpec;
  const em = c.measureText(line).width / 100;
  emCache.set(line, em);
  return em;
}

/**
 * Switch on real measurement, and drop anything measured against a previous
 * font. Call after mount, and again once webfonts finish loading — until a
 * font is actually loaded the browser measures the fallback face.
 */
export function refreshLabelMetrics(): void {
  measured = true;
  fontSpec = '';
  emCache.clear();
  cache.clear();
}

/** Does this set of lines fit inside a hexagon of circumradius `r`? */
function fits(lines: string[], font: number, r: number, rot: number): boolean {
  const inner = r * INSET;
  const lh = font * LINE_SPACING;
  for (let i = 0; i < lines.length; i++) {
    // Vertical centre of this line, relative to the bubble's centre.
    const y = (i - (lines.length - 1) / 2) * lh;
    // Worst-case vertical extent of the glyphs on that line.
    const extent = Math.abs(y) + font * 0.4;
    if (extent >= inner * HEX_HALF_H) return false;
    // Both the top and bottom edge of the line have to clear the hexagon; a
    // rotated one is narrower on one side than the other at a given height.
    const room = Math.min(hexHalfWidth(extent, inner, rot), hexHalfWidth(-extent, inner, rot));
    if ((widthEm(lines[i]) * font) / 2 > room) return false;
  }
  return true;
}

/** Largest font size at which `lines` fits, or 0 if it never does. */
function largestFont(lines: string[], r: number, rot: number): number {
  if (!fits(lines, 0.5, r, rot)) return 0;
  let lo = 0.5;
  let hi = MAX_FONT;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (fits(lines, mid, r, rot)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * Split `words` into exactly `count` contiguous lines, balanced so the longest
 * line is as short as possible. Brute force over split points — names are a
 * handful of words, so the search space is trivial.
 */
function balance(words: string[], count: number): string[] | null {
  if (count === 1) return [words.join(' ')];
  if (count > words.length) return null;

  let best: string[] | null = null;
  let bestMax = Infinity;

  const walk = (start: number, remaining: number, acc: string[]) => {
    if (remaining === 1) {
      const lines = [...acc, words.slice(start).join(' ')];
      const longest = Math.max(...lines.map((l) => l.length));
      if (longest < bestMax) {
        bestMax = longest;
        best = lines;
      }
      return;
    }
    // Leave at least one word for each remaining line.
    for (let end = start + 1; end <= words.length - remaining + 1; end++) {
      walk(end, remaining - 1, [...acc, words.slice(start, end).join(' ')]);
    }
  };

  walk(0, count, []);
  return best;
}

/**
 * Best label layout for `name` inside a hexagon of canvas circumradius `r`,
 * rotated by `rot` radians. Returns null only when the name cannot fit at any
 * size — which, since there is no minimum size here, essentially never happens
 * for real names.
 */
export function fitLabel(name: string, r: number, rot = 0): FittedLabel | null {
  // r and rot change only when the layout changes, not per simulation tick.
  const key = `${name}|${r.toFixed(1)}|${rot.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const words = name.split(/\s+/).filter(Boolean);
  let best: FittedLabel | null = null;

  for (let count = 1; count <= Math.min(words.length, MAX_LINES); count++) {
    const lines = balance(words, count);
    if (!lines) continue;
    const font = largestFont(lines, r, rot);
    if (font > 0 && (!best || font > best.fontSize)) {
      best = { lines, fontSize: font, lineHeight: font * LINE_SPACING };
    }
  }

  cache.set(key, best);
  return best;
}

// --- marks ------------------------------------------------------------------

export interface FittedMark {
  /** Canvas units, and the mark's own units multiplied by `scale`. */
  height: number;
  width: number;
  /** Multiplier from the mark's intrinsic coordinates to canvas units. */
  scale: number;
}

/**
 * Largest a mark of the given intrinsic size can be drawn inside a hexagon of
 * circumradius `r`, centred.
 *
 * The mark is a rectangle, so unlike text there's nothing to wrap and no
 * per-line chord to check — only the two corners furthest from the centre,
 * which sit at ±half its height.
 */
export function fitMark(
  markWidth: number,
  markHeight: number,
  r: number,
  rot = 0,
  inset = MARK_INSET
): FittedMark | null {
  const inner = r * inset;
  const aspect = markWidth / markHeight;

  const fitsAt = (height: number) => {
    const halfHeight = height / 2;
    if (halfHeight >= inner * HEX_HALF_H) return false;
    const room = Math.min(
      hexHalfWidth(halfHeight, inner, rot),
      hexHalfWidth(-halfHeight, inner, rot)
    );
    return (height * aspect) / 2 <= room;
  };

  if (!fitsAt(0.5)) return null;
  let lo = 0.5;
  let hi = MAX_MARK;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (fitsAt(mid)) lo = mid;
    else hi = mid;
  }
  return { height: lo, width: lo * aspect, scale: lo / markHeight };
}
