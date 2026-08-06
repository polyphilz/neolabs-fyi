/**
 * Valuation → colour step.
 *
 * Colour encodes magnitude here, not category — the one job a single-hue
 * sequential ramp is unambiguously right for. It reinforces bubble size rather
 * than competing with it, so a huge lab reads as huge twice over.
 *
 * Buckets are fixed and human-legible rather than quantile-derived, so the
 * legend says "$1–2B" instead of "4th octile".
 */
const THRESHOLDS = [500, 1000, 2000, 5000, 10_000, 25_000, 50_000];

export const VALUATION_BUCKETS = [
  '<$500M',
  '$500M–1B',
  '$1–2B',
  '$2–5B',
  '$5–10B',
  '$10–25B',
  '$25–50B',
  '$50B+',
] as const;

export function valuationStep(usdM: number): number {
  let step = 0;
  while (step < THRESHOLDS.length && usdM >= THRESHOLDS[step]) step++;
  return step;
}

/** CSS variable, so light/dark swap happens in the stylesheet, not in JS. */
export function fillFor(usdM: number): string {
  return `var(--seq-${valuationStep(usdM)})`;
}

/**
 * Labs whose valuation is genuinely unknown are drawn in neutral grey, off the
 * blue ramp. Their bubble size is a placeholder, so putting them on the ramp
 * would assert a magnitude nobody has reported.
 */
export const UNKNOWN_FILL = 'var(--unknown-fill)';
export const UNKNOWN_INK = 'var(--unknown-ink)';
