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

export interface FittedLabel {
  lines: string[];
  /** Canvas units. Multiply by the on-screen scale to get pixels. */
  fontSize: number;
  lineHeight: number;
}

/**
 * Advance width per character, in ems, for the UI sans at 600 weight. Measured
 * text would be exact, but it can't be measured before layout — so this errs
 * generous. Underestimating pushes glyphs past the circle's edge, which looks
 * broken; overestimating just drops the type a fraction of a point.
 */
const CHAR_EM = 0.58;
/**
 * Fraction of the radius the type may occupy. Text that reaches the curve
 * technically fits but reads as overflowing, so this leaves a visible ring of
 * clear space. Lowering it makes labels smaller and appear at deeper zoom —
 * that's the intended trade.
 */
const INSET = 0.74;
const LINE_SPACING = 1.12;
/** Canvas-unit ceiling, so a huge bubble doesn't shout. */
const MAX_FONT = 15;
const MAX_LINES = 3;

const widthEm = (line: string) => line.length * CHAR_EM;

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

const cache = new Map<string, FittedLabel | null>();

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
