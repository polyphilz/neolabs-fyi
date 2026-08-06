/**
 * Core domain types for the neolab dataset.
 *
 * The valuation figures in this space are messy on purpose: many are rumored,
 * several are ranges, and a handful are only known as bounds ("more than $1B").
 * We keep that fidelity in the data rather than flattening everything to a
 * single number, because the qualifier is often the most interesting part.
 */

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
  /** Valuation moved up recently (the ↑ marker). */
  rising?: boolean;
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
  | 'genentech'
  | 'mistral'
  | 'cohere'
  | 'databricks'
  | 'huggingface'
  | 'github'
  | 'salesforce'
  | 'stanford'
  | 'mit'
  | 'cmu'
  | 'berkeley'
  | 'caltech'
  | 'princeton'
  | 'technion'
  | 'hebrew'
  | 'tsinghua'
  | 'peking'
  | 'sensetime'
  | 'huawei'
  | 'highflyer'
  | 'sogou'
  | 'keen'
  | 'oxbridge'
  | 'edinburgh'
  | 'washington'
  | 'amsterdam'
  | 'toronto'
  | 'startup';

/** Lineage hubs. Individual orgs collapse into these for the graph view. */
export type LineageGroup =
  | 'openai'
  | 'deepmind'
  | 'google'
  | 'meta'
  | 'anthropic'
  | 'xai'
  | 'bigtech'
  | 'academia'
  | 'startup';

/**
 * Coarse bucket used for colour. The `space` field below is finer-grained (17+
 * values) which is too many for a legible palette, so colour keys off this.
 */
export type DomainId =
  | 'frontier'
  | 'robotics'
  | 'world'
  | 'science'
  | 'infra'
  | 'applied'
  | 'safety'
  | 'neuro';

export interface Founder {
  name: string;
  /** Where they came from. Empty for founders whose background isn't public. */
  prior?: OrgId[];
}

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
  valuation: Valuation;
  /** Year founded. */
  year: number;
  domain: DomainId;
  /** Primary space, e.g. "Frontier lab". */
  space: string;
  /** Optional qualifier, e.g. "Open source". */
  spaceDetail?: string;
  founders: Founder[];
  knownFor: string;
  location: Location;
  /** Emerged since the previous revision of the list. */
  isNew?: boolean;
  /** `public` = now listed, so its "valuation" is a market cap that moves daily. */
  status?: 'active' | 'acquihired' | 'public';
}
