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
  | 'adobe'
  | 'amazon'
  | 'alibaba'
  | 'nvidia'
  | 'tesla'
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
  | 'cisco'
  | 'didi'
  | 'basque'
  | 'bodylabs'
  | 'canonical'
  | 'chipletz'
  | 'carnegierobotics'
  | 'cambridge'
  | 'characterai'
  | 'contentfly'
  | 'circlemedical'
  | 'codeplay'
  | 'cornell'
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
  | 'michigan'
  | 'mila'
  | 'mosaicml'
  | 'neuralink'
  | 'nervana'
  | 'nexusflow'
  | 'nyu'
  | 'nus'
  | 'qualcomm'
  | 'quora'
  | 'roboflow'
  | 'roblox'
  | 'ryot'
  | 'salk'
  | 'skild'
  | 'sendyne'
  | 'stabilityai'
  | 'thinking-machines'
  | 'stripe'
  | 'toggl'
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
  | 'windsurf'
  | 'aarno'
  | 'xtr'
  | 'zapier'
  | 'genentech'
  | 'mistral'
  | 'instadeep'
  | 'onsemi'
  | 'cohere'
  | 'databricks'
  | 'huggingface'
  | 'github'
  | 'huawei'
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
  | 'sogou'
  | 'sap'
  | 'sgi'
  | 'sinovation'
  | 'keen'
  | 'oxbridge'
  | 'oxford'
  | 'edinburgh'
  | 'epfl'
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
  | 'whitehouse'
  | 'reka'
  | 'lse'
  | 'queenmary'
  | 'hpi'
  | 'ucsb'
  | 'lbnl'
  | 'spbsu'
  | 'dkfz'
  | 'kit'
  | 'umontreal'
  | 'belllabs'
  | 'ivado'
  | 'cifar'
  | 'elementai'
  | 'twitter'
  | 'snap'
  | 'steelperlot'
  | 'cincinnati'
  | 'franciscrick'
  | 'petribio'
  | 'haverford'
  | 'rochester'
  | 'uchicago'
  | 'rosehulman'
  | 'openphilanthropy'
  | 'baylor'
  | 'uthealth'
  | 'rice'
  | 'startup';

/**
 * Lineage origins. Individual orgs collapse into these for the lineage view.
 *
 * The grain is deliberately uneven. An origin earns its own row by how many
 * neolabs actually came out of it, not by what kind of institution it is — so
 * Stanford (18 labs) stands beside OpenAI (9) while Mistral and Cohere (1 each)
 * fall into `startup`. The three residual buckets at the end are the leftovers
 * that rule produces, and they are marked as such rather than being ranked as
 * if they were institutions; see LINEAGE_GROUPS.
 */
export type LineageGroup =
  | 'openai'
  | 'deepmind'
  | 'google'
  | 'meta'
  | 'anthropic'
  | 'xai'
  | 'stanford'
  | 'mit'
  | 'cmu'
  | 'berkeley'
  | 'washington'
  | 'government'
  // Residual buckets — a long tail, not a single origin.
  | 'bigtech'
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
  | 'media'
  | 'science'
  | 'inference'
  | 'compute'
  | 'applied'
  | 'safety';

/**
 * Cross-cutting attributes. Unlike `domain`, which is single-select and drives
 * layout, a lab can carry several tags — DeepSeek is open-weights *and*
 * efficient *and* general-purpose, which one field can't express.
 */
export type TagId =
  | 'open-weights'
  | 'open-source'
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
  | 'robot-foundation-models'
  | 'humanoid'
  | 'drug-discovery'
  | 'materials'
  | 'neurotech';

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

/** Legal or ownership structure worth surfacing alongside the lab record. */
export type Structure = 'subsidiary' | 'nonprofit' | 'public-benefit';

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
  /** Non-standard legal or ownership structure — see Structure. */
  structure?: Structure;
  /** An acquisition, absorption, or shutdown. */
  exit?: Exit;
}
