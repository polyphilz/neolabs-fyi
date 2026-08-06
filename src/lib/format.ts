import type { Lab, Valuation } from '../data/types';

/** "$100B", "$1.45B", "$335M" — no trailing zeros, no unit noise. */
export function money(usdM: number): string {
  if (usdM >= 1000) {
    const b = usdM / 1000;
    const s = b >= 10 ? b.toFixed(0) : b.toFixed(2).replace(/\.?0+$/, '');
    return `$${s}B`;
  }
  return `$${usdM.toFixed(0)}M`;
}

/**
 * Renders the valuation with its qualifier intact. The prefix is load-bearing:
 * ">$1B" and "$1B" describe different states of knowledge.
 */
export function valuationLabel(v: Valuation): string {
  switch (v.qualifier) {
    case 'approx':
      return `~${money(v.usdM)}`;
    case 'gt':
      return `>${money(v.usdM)}`;
    case 'lt':
      return `<${money(v.usdM)}`;
    case 'range':
      return `~${money(v.lowUsdM ?? v.usdM)}–${money(v.highUsdM ?? v.usdM)}`;
    case 'undisclosed':
      return 'Undisclosed';
    default:
      return money(v.usdM);
  }
}

/** Short human note on how firm the number is, for tooltips and detail panes. */
export function valuationCaveat(v: Valuation): string | null {
  if (v.qualifier === 'undisclosed') return 'Round announced; valuation not disclosed';
  if (v.rumored) return 'Rumored or unconfirmed';
  if (v.qualifier === 'gt') return 'Known only as a lower bound';
  if (v.qualifier === 'lt') return 'Known only as an upper bound';
  if (v.qualifier === 'range') return 'Reported as a range';
  if (v.qualifier === 'approx') return 'Approximate';
  return null;
}

export function spaceLabel(lab: Lab): string {
  return lab.spaceDetail ? `${lab.space} — ${lab.spaceDetail}` : lab.space;
}

export function founderNames(lab: Lab): string {
  return lab.founders.map((f) => f.name).join(', ');
}

/**
 * Display names for the canvas only — the full legal-ish name stays on the
 * profile page and in the table. This is presentation, not data, which is why
 * it lives here rather than in the dataset.
 */
const CANVAS_NAMES: Record<string, string> = {
  ssi: 'SSI',
  'thinking-machines-lab': 'Thinking Machines',
  'project-prometheus': 'Prometheus',
  'recursive-superintelligence': 'Recursive SI',
  'ineffable-intelligence': 'Ineffable',
  'physical-intelligence': 'Physical Intel.',
  'standard-intelligence': 'Standard Intel.',
  'unconventional-ai': 'Unconventional',
  'core-automation': 'Core Auto.',
  'flapping-airplanes': 'Flapping',
  evolutionaryscale: 'EvoScale',
  'h-company': 'H',
  'inflection-ai': 'Inflection',
  'reflection-ai': 'Reflection',
  'isomorphic-labs': 'Isomorphic',
  'xaira-therapeutics': 'Xaira',
  'chai-discovery': 'Chai',
  'periodic-labs': 'Periodic',
  'lila-sciences': 'Lila',
  'inception-labs': 'Inception',
  'adaption-labs': 'Adaption',
  'nous-research': 'Nous',
  'essential-ai': 'Essential',
  'skild-ai': 'Skild',
  'sooth-labs': 'Sooth',
  'genesis-ai': 'Genesis',
  'sakana-ai': 'Sakana',
  'arcee-ai': 'Arcee',
  'axiom-math': 'Axiom',
  'rhoda-ai': 'Rhoda',
  'ai21-labs': 'AI21',
  'prime-intellect': 'Prime Intellect',
  'general-intuition': 'Gen. Intuition',
  'brain-computer': 'Merge',
  'merge-labs': 'Merge Labs',
  'discovery-loop': 'Discovery Loop',
  'zhipu-ai': 'Zhipu AI',
  'moonshot-ai': 'Moonshot',
  'baichuan-ai': 'Baichuan',
  'moonlake-ai': 'Moonlake',
  agibot: 'AgiBot',
  '01-ai': '01.AI',
  'sarvam-ai': 'Sarvam',
  'oak-lab': 'Oak Lab',
};

/** Display name for the canvas — the short form where one exists. */
export function canvasName(lab: Lab): string {
  return CANVAS_NAMES[lab.slug] ?? lab.name;
}

