import type { DomainId, LineageGroup, OrgId, Structure, TagId } from './types';

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
  physical: {
    label: 'Physical AI & robotics',
    blurb:
      'Robot foundation models, embodied intelligence, and AI for real-world ' +
      'automation — manufacturing, supply chain, and physical engineering.',
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
    blurb: 'Training hardware, chip design, distributed compute, and the orchestration layers above them.',
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
  'physical',
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
  math: 'Math',
  vision: 'Vision',
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
  'math',
  'vision',
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
  ibm: { label: 'IBM', group: 'bigtech' },
  verizon: { label: 'Verizon', group: 'bigtech' },
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
  intel: { label: 'Intel', group: 'bigtech' },
  qualcomm: { label: 'Qualcomm', group: 'bigtech' },
  uber: { label: 'Uber', group: 'bigtech' },
  ea: { label: 'Electronic Arts', group: 'bigtech' },
  dropbox: { label: 'Dropbox', group: 'bigtech' },
  stripe: { label: 'Stripe', group: 'bigtech' },
  epicgames: { label: 'Epic Games', group: 'bigtech' },
  baidu: { label: 'Baidu', group: 'bigtech' },
  roblox: { label: 'Roblox', group: 'bigtech' },
  technicolor: { label: 'Technicolor', group: 'bigtech' },
  o2micro: { label: 'O2Micro', group: 'bigtech' },
  onsemi: { label: 'onsemi', group: 'bigtech' },
  jpmorgan: { label: 'J.P. Morgan', group: 'bigtech' },

  unit8200: { label: 'Unit 8200', group: 'government' },
  uidai: { label: 'UIDAI / Aadhaar', group: 'government' },

  sensetime: { label: 'SenseTime', group: 'startup' },
  sogou: { label: 'Sogou', group: 'startup' },
  highflyer: { label: 'High-Flyer', group: 'startup' },
  keen: { label: 'Keen Technologies', group: 'startup' },
  huawei: { label: 'Huawei', group: 'bigtech' },
  mistral: { label: 'Mistral', group: 'mistral' },
  cohere: { label: 'Cohere', group: 'cohere' },
  databricks: { label: 'Databricks / MosaicML', group: 'startup' },
  huggingface: { label: 'Hugging Face', group: 'startup' },
  startup: { label: 'Other startups', group: 'startup' },
  ai21: { label: 'AI21 Labs', group: 'startup' },
  adept: { label: 'Adept', group: 'startup' },
  skild: { label: 'Skild AI', group: 'startup' },
  stabilityai: { label: 'Stability AI', group: 'startup' },
  megvii: { label: 'Megvii', group: 'startup' },
  neuralink: { label: 'Neuralink', group: 'startup' },
  anduril: { label: 'Anduril', group: 'startup' },
  roboflow: { label: 'Roboflow', group: 'startup' },
  quora: { label: 'Quora', group: 'startup' },
  absci: { label: 'Absci', group: 'startup' },
  aqemia: { label: 'Aqemia', group: 'startup' },
  canonical: { label: 'Canonical', group: 'startup' },
  iqm: { label: 'IQM', group: 'startup' },
  valeo: { label: 'Valeo.ai', group: 'startup' },
  eleuther: { label: 'EleutherAI', group: 'startup' },
  foresite: { label: 'Foresite Labs', group: 'startup' },
  greylock: { label: 'Greylock', group: 'startup' },
  forestneuro: { label: 'Forest Neurotech', group: 'startup' },
  flyingfish: { label: 'Flying Fish Partners', group: 'startup' },
  fundamental: { label: 'Fundamental', group: 'startup' },
  isomorphic: { label: 'Isomorphic Labs', group: 'startup' },
  instadeep: { label: 'InstaDeep', group: 'startup' },
  carnegierobotics: { label: 'Carnegie Robotics', group: 'startup' },
  vantai: { label: 'VantAI', group: 'startup' },
  medal: { label: 'Medal', group: 'startup' },
  ubisoft: { label: 'Ubisoft', group: 'startup' },
  dataiku: { label: 'Dataiku', group: 'startup' },
  wayve: { label: 'Wayve', group: 'startup' },
  toggl: { label: 'Toggl', group: 'startup' },
  zapier: { label: 'Zapier', group: 'startup' },
  contentfly: { label: 'ContentFly / Draft', group: 'startup' },
  jackman: { label: 'Jackman', group: 'startup' },
  ryot: { label: 'RYOT', group: 'startup' },
  xtr: { label: 'XTR', group: 'startup' },
  asteria: { label: 'Asteria', group: 'startup' },
  anyscale: { label: 'Anyscale', group: 'startup' },
  characterai: { label: 'Character.AI', group: 'startup' },
  'thinking-machines': { label: 'Thinking Machines Lab', group: 'startup' },
  'nebula-sunac': { label: 'Nebula Sunac', group: 'startup' },
  wankang: { label: 'Wankang Century Technology', group: 'startup' },
  cyberkinetics: { label: 'Cyberkinetics', group: 'startup' },
  thirdrock: { label: 'Third Rock Ventures', group: 'startup' },
  aestudio: { label: 'AE Studio', group: 'startup' },
  toolsforhumanity: { label: 'Tools for Humanity / World', group: 'startup' },
  loopt: { label: 'Loopt', group: 'startup' },
  ycombinator: { label: 'Y Combinator', group: 'startup' },

  stanford: { label: 'Stanford', group: 'academia' },
  mit: { label: 'MIT', group: 'academia' },
  cmu: { label: 'Carnegie Mellon', group: 'academia' },
  berkeley: { label: 'UC Berkeley', group: 'academia' },
  caltech: { label: 'Caltech', group: 'academia' },
  princeton: { label: 'Princeton', group: 'academia' },
  technion: { label: 'Technion', group: 'academia' },
  hebrew: { label: 'Hebrew University', group: 'academia' },
  cambridge: { label: 'University of Cambridge', group: 'academia' },
  oxbridge: { label: 'Oxford / Cambridge', group: 'academia' },
  edinburgh: { label: 'Edinburgh', group: 'academia' },
  geneva: { label: 'University of Geneva', group: 'academia' },
  epfl: { label: 'EPFL', group: 'academia' },
  beijingjiaotong: { label: 'Beijing Jiaotong University', group: 'academia' },
  cas: { label: 'Chinese Academy of Sciences', group: 'academia' },
  shanxi: { label: 'Shanxi University', group: 'academia' },
  ahut: { label: 'Anhui University of Technology', group: 'academia' },
  imperial: { label: 'Imperial College London', group: 'academia' },
  maxplanck: { label: 'Max Planck Institute', group: 'academia' },
  saarland: { label: 'Saarland University', group: 'academia' },
  mila: { label: 'Mila', group: 'academia' },
  seoulnational: { label: 'Seoul National University', group: 'academia' },
  nus: { label: 'National University of Singapore', group: 'academia' },
  shandong: { label: 'Shandong University', group: 'academia' },
  basque: { label: 'University of the Basque Country', group: 'academia' },
  oxford: { label: 'University of Oxford', group: 'academia' },
  ntu: { label: 'Nanyang Technological University', group: 'academia' },
  waterloo: { label: 'University of Waterloo', group: 'academia' },
  psl: { label: 'Paris Dauphine–PSL', group: 'academia' },
  centralesupelec: { label: 'CentraleSupélec', group: 'academia' },
  polytechnique: { label: 'École Polytechnique', group: 'academia' },
  ponts: { label: 'École des Ponts', group: 'academia' },
  idsia: { label: 'IDSIA', group: 'academia' },
  vub: { label: 'Vrije Universiteit Brussel', group: 'academia' },
  maastricht: { label: 'Maastricht University', group: 'academia' },
  liverpool: { label: 'University of Liverpool', group: 'academia' },
  lille: { label: 'University of Lille', group: 'academia' },
  brown: { label: 'Brown University', group: 'academia' },
  utah: { label: 'University of Utah', group: 'academia' },
  ucirvine: { label: 'UC Irvine', group: 'academia' },
  fau: { label: 'FAU Erlangen–Nürnberg', group: 'academia' },
  washington: { label: 'U. Washington', group: 'academia' },
  amsterdam: { label: 'U. Amsterdam', group: 'academia' },
  toronto: { label: 'U. Toronto', group: 'academia' },
  tsinghua: { label: 'Tsinghua', group: 'academia' },
  peking: { label: 'Peking University', group: 'academia' },
  nyu: { label: 'NYU', group: 'academia' },
  ucl: { label: 'UCL', group: 'academia' },
  alberta: { label: 'U. Alberta', group: 'academia' },
  harvard: { label: 'Harvard', group: 'academia' },
  ucla: { label: 'UCLA', group: 'academia' },
  cornell: { label: 'Cornell', group: 'academia' },
  michigan: { label: 'U. Michigan', group: 'academia' },
  mcgill: { label: 'McGill', group: 'academia' },
  georgiatech: { label: 'Georgia Tech', group: 'academia' },
  ista: { label: 'ISTA (Austria)', group: 'academia' },
};

/** Lineage hubs, in the order they're laid out around the graph. */
export const LINEAGE_GROUPS: Record<LineageGroup, { label: string; short: string }> = {
  openai: { label: 'OpenAI', short: 'OpenAI' },
  deepmind: { label: 'Google DeepMind', short: 'DeepMind' },
  google: { label: 'Google', short: 'Google' },
  meta: { label: 'Meta / FAIR', short: 'Meta' },
  anthropic: { label: 'Anthropic', short: 'Anthropic' },
  xai: { label: 'xAI', short: 'xAI' },
  mistral: { label: 'Mistral', short: 'Mistral' },
  cohere: { label: 'Cohere', short: 'Cohere' },
  bigtech: { label: 'Other big tech', short: 'Big tech' },
  government: { label: 'Government / military', short: 'Gov' },
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
  'mistral',
  'cohere',
  'bigtech',
  'government',
  'academia',
  'startup',
];

/**
 * Colour tokens.
 *
 * Deliberate choice: hue does NOT encode research area. Eleven domains in a
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

export const STRUCTURE_LABEL: Record<Structure, string> = {
  subsidiary: 'Corporate subsidiary',
  nonprofit: 'Non-profit',
  planned: 'Announced, not yet operating',
};
