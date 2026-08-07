/**
 * Fitting a lab name inside a circle.
 *
 * Two things make this more than a character count:
 *
 * 1. A circle's usable width varies with height. The widest line belongs in the
 *    middle; lines above and below have progressively shorter chords. So the
 *    check is per-line against the chord at that line's own offset, not against
 *    the diameter.
 * 2. Wrapping buys a lot. "Thinking Machines" on one line needs a circle nearly
 *    twice as wide as the same name split across two. Names are wrapped at word
 *    boundaries, and we take whichever line count yields the largest type.
 *
 * The result is in *canvas* units. Whether it's actually legible depends on the
 * zoom level, which the caller applies — that's what makes labels appear as you
 * zoom into a small bubble.
 */

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
 * circle's edge, which looks broken.
 */
const FALLBACK_CHAR_EM = 0.58;

/** Weight the bubble labels are drawn at; metrics must match. */
const LABEL_WEIGHT = 600;
/**
 * Fraction of the radius the type may occupy. Text that reaches the curve
 * technically fits but reads as overflowing, so this leaves a visible ring of
 * clear space. Lowering it makes labels smaller and appear at deeper zoom —
 * that's the intended trade.
 */
const INSET = 0.70;
export const LINE_SPACING = 1.12;
/** Canvas-unit ceiling, so a huge bubble doesn't shout. */
const MAX_FONT = 15;
const MAX_LINES = 3;

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
    const family =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-display')
        .trim() || 'Georgia, serif';
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

/** Does this set of lines fit inside radius `r` at this font size? */
function fits(lines: string[], font: number, r: number): boolean {
  const inner = r * INSET;
  const lh = font * LINE_SPACING;
  for (let i = 0; i < lines.length; i++) {
    // Vertical centre of this line, relative to the circle's centre.
    const y = (i - (lines.length - 1) / 2) * lh;
    // Worst-case vertical extent of the glyphs on that line.
    const extent = Math.abs(y) + font * 0.4;
    if (extent >= inner) return false;
    const halfChord = Math.sqrt(inner * inner - extent * extent);
    if ((widthEm(lines[i]) * font) / 2 > halfChord) return false;
  }
  return true;
}

/** Largest font size at which `lines` fits, or 0 if it never does. */
function largestFont(lines: string[], r: number): number {
  if (!fits(lines, 0.5, r)) return 0;
  let lo = 0.5;
  let hi = MAX_FONT;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (fits(lines, mid, r)) lo = mid;
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
 * Best label layout for `name` inside a circle of canvas radius `r`.
 * Returns null only when the name cannot fit at any size — which, since there
 * is no minimum size here, essentially never happens for real names.
 */
export function fitLabel(name: string, r: number): FittedLabel | null {
  // r changes only when the layout changes, not per simulation tick.
  const key = `${name}|${r.toFixed(1)}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const words = name.split(/\s+/).filter(Boolean);
  let best: FittedLabel | null = null;

  for (let count = 1; count <= Math.min(words.length, MAX_LINES); count++) {
    const lines = balance(words, count);
    if (!lines) continue;
    const font = largestFont(lines, r);
    if (font > 0 && (!best || font > best.fontSize)) {
      best = { lines, fontSize: font, lineHeight: font * LINE_SPACING };
    }
  }

  cache.set(key, best);
  return best;
}
