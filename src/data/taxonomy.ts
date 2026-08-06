import type { DomainId, LineageGroup, OrgId, TagId } from './types';

/**
 * Domains — the coarse buckets shown in the legend and used to cluster the
 * research-area layout. `space` on each lab stays finer-grained; this is the
 * level a person can actually hold in their head.
 */
export const DOMAINS: Record<DomainId, { label: string; blurb: string }> = {
  general: {
    label: 'General-purpose models',
    blurb: 'Broad frontier model labs without a single narrower thesis.',
  },
  coding: {
    label: 'Coding',
    blurb: 'Models built specifically to write and reason about software.',
  },
  rsi: {
    label: 'Recursive self-improvement',
    blurb: 'Systems that automate AI research, or improve from their own experience.',
  },
  robotics: {
    label: 'Robotics',
    blurb: 'Robot foundation models and embodied intelligence.',
  },
  world: {
    label: 'World models',
    blurb: 'Learned simulators, video models, and agent simulation.',
  },
  science: {
    label: 'AI for science',
    blurb: 'Bio, drug discovery, materials, formal math, quantum.',
  },
  inference: {
    label: 'Inference',
    blurb: 'Serving models faster and cheaper at scale.',
  },
  compute: {
    label: 'Compute & chips',
    blurb: 'Training hardware, chip design, and distributed compute.',
  },
  applied: {
    label: 'Applied & agents',
    blurb: 'Enterprise models, agent platforms, voice.',
  },
  safety: {
    label: 'Interpretability',
    blurb: 'Understanding and steering model internals.',
  },
  neuro: {
    label: 'Neurotech',
    blurb: 'Brain-computer interfaces.',
  },
};

/** Fixed display order — legend, filter chips, and area-view clusters all use it. */
export const DOMAIN_ORDER: DomainId[] = [
  'general',
  'coding',
  'rsi',
  'robotics',
  'world',
  'science',
  'inference',
  'compute',
  'applied',
  'safety',
  'neuro',
];

/**
 * Tag vocabulary. Deliberately cross-cutting — anything that would be a second
 * taxonomy of "what field is this" belongs in DOMAINS instead.
 */
export const TAGS: Record<TagId, string> = {
  'open-weights': 'Open weights',
  multimodal: 'Multimodal',
  efficient: 'Efficient / on-device',
  'continual-learning': 'Continual learning',
  reasoning: 'Reasoning',
  agents: 'Agents',
  video: 'Video',
  voice: 'Voice',
  sovereign: 'Sovereign AI',
  'academic-spinout': 'Academic spinout',
  humanoid: 'Humanoid',
  'drug-discovery': 'Drug discovery',
  materials: 'Materials',
};

export const TAG_ORDER: TagId[] = [
  'open-weights',
  'multimodal',
  'efficient',
  'continual-learning',
  'reasoning',
  'agents',
  'video',
  'voice',
  'humanoid',
  'drug-discovery',
  'materials',
  'sovereign',
  'academic-spinout',
];

/**
 * Prior affiliations. `group` collapses them into lineage hubs for the graph;
 * `label` is what the detail panel shows.
 */
export const ORGS: Record<OrgId, { label: string; group: LineageGroup }> = {
  openai: { label: 'OpenAI', group: 'openai' },
  deepmind: { label: 'Google DeepMind', group: 'deepmind' },
  google: { label: 'Google', group: 'google' },
  meta: { label: 'Meta (FAIR)', group: 'meta' },
  anthropic: { label: 'Anthropic', group: 'anthropic' },
  xai: { label: 'xAI', group: 'xai' },

  microsoft: { label: 'Microsoft', group: 'bigtech' },
  apple: { label: 'Apple', group: 'bigtech' },
  amazon: { label: 'Amazon', group: 'bigtech' },
  nvidia: { label: 'Nvidia', group: 'bigtech' },
  tesla: { label: 'Tesla', group: 'bigtech' },
  softbank: { label: 'SoftBank', group: 'bigtech' },
  amd: { label: 'AMD', group: 'bigtech' },
  github: { label: 'GitHub', group: 'bigtech' },
  salesforce: { label: 'Salesforce', group: 'bigtech' },
  genentech: { label: 'Genentech', group: 'bigtech' },
  mobileye: { label: 'Mobileye', group: 'bigtech' },

  sensetime: { label: 'SenseTime', group: 'startup' },
  sogou: { label: 'Sogou', group: 'startup' },
  highflyer: { label: 'High-Flyer', group: 'startup' },
  keen: { label: 'Keen Technologies', group: 'startup' },
  huawei: { label: 'Huawei', group: 'bigtech' },
  mistral: { label: 'Mistral', group: 'startup' },
  cohere: { label: 'Cohere', group: 'startup' },
  databricks: { label: 'Databricks / MosaicML', group: 'startup' },
  huggingface: { label: 'Hugging Face', group: 'startup' },
  startup: { label: 'Other startups', group: 'startup' },

  stanford: { label: 'Stanford', group: 'academia' },
  mit: { label: 'MIT', group: 'academia' },
  cmu: { label: 'Carnegie Mellon', group: 'academia' },
  berkeley: { label: 'UC Berkeley', group: 'academia' },
  caltech: { label: 'Caltech', group: 'academia' },
  princeton: { label: 'Princeton', group: 'academia' },
  technion: { label: 'Technion', group: 'academia' },
  hebrew: { label: 'Hebrew University', group: 'academia' },
  oxbridge: { label: 'Oxford / Cambridge', group: 'academia' },
  edinburgh: { label: 'Edinburgh', group: 'academia' },
  washington: { label: 'U. Washington', group: 'academia' },
  amsterdam: { label: 'U. Amsterdam', group: 'academia' },
  toronto: { label: 'U. Toronto', group: 'academia' },
  tsinghua: { label: 'Tsinghua', group: 'academia' },
  peking: { label: 'Peking University', group: 'academia' },
};

/** Lineage hubs, in the order they're laid out around the graph. */
export const LINEAGE_GROUPS: Record<LineageGroup, { label: string; short: string }> = {
  openai: { label: 'OpenAI', short: 'OpenAI' },
  deepmind: { label: 'Google DeepMind', short: 'DeepMind' },
  google: { label: 'Google', short: 'Google' },
  meta: { label: 'Meta / FAIR', short: 'Meta' },
  anthropic: { label: 'Anthropic', short: 'Anthropic' },
  xai: { label: 'xAI', short: 'xAI' },
  bigtech: { label: 'Other big tech', short: 'Big tech' },
  academia: { label: 'Academia', short: 'Academia' },
  startup: { label: 'Other startups', short: 'Startups' },
};

export const LINEAGE_ORDER: LineageGroup[] = [
  'openai',
  'deepmind',
  'google',
  'meta',
  'anthropic',
  'xai',
  'bigtech',
  'academia',
  'startup',
];

/**
 * Colour tokens.
 *
 * Deliberate choice: hue does NOT encode research area. Eight domains in a
 * free-mixing bubble field is an all-pairs colour problem, and no 5+ subset of
 * a validated categorical palette clears the normal-vision separation floor —
 * i.e. sighted users genuinely cannot tell some pairs apart. So:
 *
 *   - magnitude (valuation) gets the sequential blue ramp — colour doing the
 *     job colour is actually good at, reinforcing the bubble-size encoding;
 *   - research area is carried by position (clustered, labelled layout), the
 *     per-bubble label, the tooltip, and the table view;
 *   - the categorical slots are held in reserve for genuine <= 4 splits.
 *
 * Values are from the validated reference palette; sequential steps are the
 * blue ramp 100-700.
 */
export const SEQ_STEPS = 8;

/**
 * Light surface: pale for small labs, deep for large. Starts at ramp step 250,
 * the lightest step that still clears 2:1 against the light surface, so the
 * smallest bubbles stay visible instead of dissolving into the page.
 */
export const SEQ_LIGHT = [
  '#86b6ef',
  '#6da7ec',
  '#5598e7',
  '#3987e5',
  '#2a78d6',
  '#256abf',
  '#184f95',
  '#0d366b',
] as const;

/**
 * Dark surface: the same ramp read the other way, so "large" is still the
 * dominant end. Bottoms out at step 600, the darkest that clears 2:1 on dark.
 */
export const SEQ_DARK = [
  '#184f95',
  '#256abf',
  '#2a78d6',
  '#3987e5',
  '#5598e7',
  '#6da7ec',
  '#86b6ef',
  '#b7d3f6',
] as const;

/** Two-state accent — selection and the "new this year" marker. Not categorical. */
export const ACCENT = { light: '#eb6834', dark: '#d95926' } as const;

/** The four all-pairs-safe categorical slots, for <= 4-way splits only. */
export const CATEGORICAL = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#4a3aa7'],
  dark: ['#3987e5', '#d95926', '#199e70', '#9085e9'],
} as const;
