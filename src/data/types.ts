/**
 * Core domain types for the neolab dataset.
 *
 * The valuation figures in this space are messy on purpose: many are rumored,
 * several are ranges, and a handful are only known as bounds ("more than $1B").
 * We keep that fidelity in the data rather than flattening everything to a
 * single number, because the qualifier is often the most interesting part.
 */

import type { PersonId } from './people';

/** How precisely a valuation is known. */
export type Qualifier =
  | 'exact' // reported figure
  | 'approx' // "~$4B"
  | 'gt' // ">$1B"
  | 'lt' // "<$500M"
  | 'range' // "~$2.7-4B"
  | 'undisclosed'; // round announced, figure withheld

export interface Valuation {
  /**
   * Millions USD. Used for sizing and sorting. For ranges, the midpoint.
   *
   * For `undisclosed` this is a nominal placeholder so the bubble has *some*
   * radius — it is not a claim. Those bubbles render in neutral grey rather
   * than on the blue magnitude ramp, so they can't be misread as a figure.
   */
  usdM: number;
  qualifier: Qualifier;
  /** Lower bound, only for `range`. */
  lowUsdM?: number;
  /** Upper bound, only for `range`. */
  highUsdM?: number;
  /** Figure is rumored / unconfirmed. */
  rumored?: boolean;
  /**
   * ISO date the figure was true. Only meaningful for `status: 'public'` labs,
   * whose "valuation" is a market cap that moves every trading day. A private
   * round's figure has no expiry; a market cap does.
   */
  asOf?: string;
}

/**
 * Canonical prior-affiliation ids. These drive the lineage graph, so the set is
 * deliberately closed — a free-text field would fragment the hubs.
 */
export type OrgId =
  | 'openai'
  | 'deepmind'
  | 'google'
  | 'meta'
  | 'anthropic'
  | 'xai'
  | 'microsoft'
  | 'apple'
  | 'amazon'
  | 'nvidia'
  | 'tesla'
  | 'softbank'
  | 'amd'
  | 'mobileye'
  | 'absci'
  | 'aqemia'
  | 'adept'
  | 'ai21'
  | 'alberta'
  | 'anduril'
  | 'anyscale'
  | 'asteria'
  | 'atheros'
  | 'archer'
  | 'baidu'
  | 'basque'
  | 'beijingjiaotong'
  | 'bodylabs'
  | 'canonical'
  | 'chipletz'
  | 'carnegierobotics'
  | 'cambridge'
  | 'characterai'
  | 'contentfly'
  | 'cornell'
  | 'cas'
  | 'dataiku'
  | 'dropbox'
  | 'ea'
  | 'eleuther'
  | 'epicgames'
  | 'foresite'
  | 'forestneuro'
  | 'figureai'
  | 'flyingfish'
  | 'fundamental'
  | 'fyusion'
  | 'geneva'
  | 'georgiatech'
  | 'greylock'
  | 'harvard'
  | 'ibm'
  | 'imperial'
  | 'intel'
  | 'iqm'
  | 'isomorphic'
  | 'ista'
  | 'jackman'
  | 'jpmorgan'
  | 'mcgill'
  | 'medal'
  | 'megvii'
  | 'michigan'
  | 'mila'
  | 'mosaicml'
  | 'neuralink'
  | 'nervana'
  | 'nebula-sunac'
  | 'nyu'
  | 'nus'
  | 'qualcomm'
  | 'o2micro'
  | 'quora'
  | 'roboflow'
  | 'roblox'
  | 'ryot'
  | 'salk'
  | 'skild'
  | 'sendyne'
  | 'stabilityai'
  | 'thinking-machines'
  | 'shanxi'
  | 'stripe'
  | 'toggl'
  | 'technicolor'
  | 'ucl'
  | 'ucla'
  | 'uber'
  | 'uidai'
  | 'unit8200'
  | 'ubisoft'
  | 'valeo'
  | 'vantai'
  | 'verizon'
  | 'wayve'
  | 'aarno'
  | 'wankang'
  | 'xtr'
  | 'cruise'
  | 'funplus'
  | 'gsr'
  | 'recurrentai'
  | 'samsung'
  | 'booz'
  | 'tencent'
  | 'hulu'
  | 'zapier'
  | 'genentech'
  | 'mistral'
  | 'instadeep'
  | 'onsemi'
  | 'cohere'
  | 'databricks'
  | 'huggingface'
  | 'github'
  | 'salesforce'
  | 'stanford'
  | 'maxplanck'
  | 'mit'
  | 'cmu'
  | 'berkeley'
  | 'caltech'
  | 'centralesupelec'
  | 'idsia'
  | 'lille'
  | 'liverpool'
  | 'maastricht'
  | 'polytechnique'
  | 'ponts'
  | 'psl'
  | 'vub'
  | 'princeton'
  | 'technion'
  | 'hebrew'
  | 'tsinghua'
  | 'peking'
  | 'pixar'
  | 'sensetime'
  | 'huawei'
  | 'highflyer'
  | 'sogou'
  | 'keen'
  | 'oxbridge'
  | 'oxford'
  | 'edinburgh'
  | 'epfl'
  | 'ahut'
  | 'saarland'
  | 'seoulnational'
  | 'shandong'
  | 'washington'
  | 'amsterdam'
  | 'toronto'
  | 'uiuc'
  | 'ntu'
  | 'waterloo'
  | 'aestudio'
  | 'brown'
  | 'cyberkinetics'
  | 'fau'
  | 'loopt'
  | 'thirdrock'
  | 'toolsforhumanity'
  | 'ucirvine'
  | 'utah'
  | 'ycombinator'
  | 'startup';

/** Lineage hubs. Individual orgs collapse into these for the graph view. */
export type LineageGroup =
  | 'openai'
  | 'deepmind'
  | 'google'
  | 'meta'
  | 'anthropic'
  | 'xai'
  | 'mistral'
  | 'cohere'
  | 'bigtech'
  | 'government'
  | 'academia'
  | 'startup';

/**
 * Coarse bucket used for colour. The `space` field below is finer-grained (17+
 * values) which is too many for a legible palette, so colour keys off this.
 */
export type DomainId =
  | 'general'
  | 'coding'
  | 'rsi'
  | 'physical'
  | 'world'
  | 'science'
  | 'inference'
  | 'compute'
  | 'applied'
  | 'safety'
  | 'neuro';

/**
 * Cross-cutting attributes. Unlike `domain`, which is single-select and drives
 * layout, a lab can carry several tags — DeepSeek is open-weights *and*
 * efficient *and* general-purpose, which one field can't express.
 */
export type TagId =
  | 'open-weights'
  | 'multimodal'
  | 'efficient'
  | 'continual-learning'
  | 'math'
  | 'vision'
  | 'agents'
  | 'video'
  | 'voice'
  | 'sovereign'
  | 'academic-spinout'
  | 'humanoid'
  | 'drug-discovery'
  | 'materials';

/**
 * A person's role at ONE lab. `prior` is per-lab on purpose: it means "what
 * they had done before *this* lab", which changes each time someone founds
 * something new.
 */
export interface LabFounder {
  person: PersonId;
  /** Notable prior affiliations, as of founding this lab. */
  prior?: OrgId[];
  /** No longer at this lab. Still a founder — founding is historical fact. */
  departed?: true;
  /**
   * Provided capital, or is the corporate parent, rather than founding
   * research. Excluded from lineage edges — a funder's employer is not a
   * research lineage.
   */
  isBacker?: true;
}

/** An acquisition, team absorption, or shutdown. */
export interface Exit {
  type: 'acquired' | 'acquihire' | 'shutdown';
  /**
   * The lab no longer operates as itself. `false` for a partial acquihire, or
   * an acquisition run on as a subsidiary. Drives the derived `isDefunct`.
   */
  absorbed: boolean;
  /** Who absorbed it. A lab slug when they are on the map ('reka'), else a
   * plain name. Omitted for a shutdown. */
  to?: string;
  year: number;
}

/**
 * Labs that were never independent. Their "valuation" is a structurally
 * different claim from a private round, so they are held off the magnitude
 * ramp the same way `undisclosed` is.
 */
export type Structure = 'subsidiary' | 'nonprofit' | 'planned';

export interface Location {
  city: string;
  country: string;
  /** ISO 3166-1 alpha-2, for grouping and flags. */
  cc: string;
  lat: number;
  lon: number;
}

export interface Lab {
  slug: string;
  name: string;
  /** Former names, most recent first. Rendered on the lab page for SEO. */
  priorNames?: string[];
  valuation: Valuation;
  year: number; // Year of public emergence.
  domain: DomainId;
  /** Cross-cutting attributes; see TagId. */
  tags?: TagId[];
  founders: LabFounder[];
  knownFor: string;
  location: Location;
  /** How the lab is owned. Absent = private. `public` = now listed, so its
   * "valuation" is a market cap that moves daily. */
  status?: 'private' | 'public';
  /** Never-independent labs — see Structure. */
  structure?: Structure;
  /** An acquisition, absorption, or shutdown. */
  exit?: Exit;
}
