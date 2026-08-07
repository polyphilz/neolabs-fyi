import { DOMAIN_ORDER, LINEAGE_ORDER, TAG_ORDER } from '../data/taxonomy';
import type { DomainId, Lab, LineageGroup, TagId } from '../data/types';
import {
  VIEW_IDS,
  lineageGroupsOf,
  type CategoricalSizeScale,
  type ViewId,
} from './layout';

export interface Filters {
  view: ViewId;
  /** Bubble-size encoding for the three categorical canvas views. */
  sizeScale: CategoricalSizeScale;
  /** Valuation bounds in millions USD. */
  minUsdM: number;
  maxUsdM: number;
  minYear: number;
  maxYear: number;
  /** Empty means "all" — an explicit empty selection would show nothing. */
  domains: DomainId[];
  lineage: LineageGroup[];
  /** A lab must carry every selected tag, not just one — these narrow. */
  tags: TagId[];
}

export function bounds(labs: Lab[]) {
  const vals = labs.map((l) => l.valuation.usdM);
  const years = labs.map((l) => l.year);
  return {
    minUsdM: Math.min(...vals),
    maxUsdM: Math.max(...vals),
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
  };
}

export function defaultFilters(labs: Lab[]): Filters {
  const b = bounds(labs);
  return { view: 'area', sizeScale: 'log', ...b, domains: [], lineage: [], tags: [] };
}

export function applyFilters(labs: Lab[], f: Filters): Lab[] {
  return labs.filter((lab) => {
    if (lab.valuation.usdM < f.minUsdM || lab.valuation.usdM > f.maxUsdM) return false;
    if (lab.year < f.minYear || lab.year > f.maxYear) return false;
    if (f.domains.length && !f.domains.includes(lab.domain)) return false;
    if (f.lineage.length && !lineageGroupsOf(lab).some((g) => f.lineage.includes(g))) return false;
    if (f.tags.length && !f.tags.every((t) => lab.tags?.includes(t))) return false;
    return true;
  });
}

export function isDefault(f: Filters, labs: Lab[]): boolean {
  const b = bounds(labs);
  return (
    f.minUsdM === b.minUsdM &&
    f.maxUsdM === b.maxUsdM &&
    f.minYear === b.minYear &&
    f.maxYear === b.maxYear &&
    (f.view === 'valuation' || f.view === 'table' || f.sizeScale === 'log') &&
    !f.domains.length &&
    !f.lineage.length &&
    !f.tags.length
  );
}

// ---------------------------------------------------------------------------
// URL round-tripping — every filter state is a shareable, linkable page
// ---------------------------------------------------------------------------

export function toParams(
  f: Filters,
  labs: Lab[],
  selected: string | null,
  query = ''
): URLSearchParams {
  const b = bounds(labs);
  const p = new URLSearchParams();
  if (f.view !== 'area') p.set('view', f.view);
  if (f.sizeScale === 'valuation') p.set('size', 'valuation');
  if (query.trim()) p.set('q', query);
  if (f.minUsdM !== b.minUsdM) p.set('vmin', String(f.minUsdM));
  if (f.maxUsdM !== b.maxUsdM) p.set('vmax', String(f.maxUsdM));
  if (f.minYear !== b.minYear) p.set('ymin', String(f.minYear));
  if (f.maxYear !== b.maxYear) p.set('ymax', String(f.maxYear));
  if (f.domains.length) p.set('area', f.domains.join(','));
  if (f.lineage.length) p.set('from', f.lineage.join(','));
  if (f.tags.length) p.set('tag', f.tags.join(','));
  if (selected) p.set('lab', selected);
  return p;
}

export function fromParams(
  p: URLSearchParams,
  labs: Lab[]
): { filters: Filters; selected: string | null; query: string } {
  const base = defaultFilters(labs);
  const num = (key: string, fallback: number) => {
    const raw = p.get(key);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };
  const list = <T extends string>(key: string, allowed: readonly T[]): T[] => {
    const raw = p.get(key);
    if (!raw) return [];
    return raw.split(',').filter((v): v is T => (allowed as readonly string[]).includes(v));
  };
  const view = p.get('view');

  return {
    filters: {
      view: VIEW_IDS.includes(view as ViewId) ? (view as ViewId) : base.view,
      sizeScale: p.get('size') === 'valuation' ? 'valuation' : 'log',
      minUsdM: num('vmin', base.minUsdM),
      maxUsdM: num('vmax', base.maxUsdM),
      minYear: num('ymin', base.minYear),
      maxYear: num('ymax', base.maxYear),
      domains: list('area', DOMAIN_ORDER),
      lineage: list('from', LINEAGE_ORDER),
      tags: list('tag', TAG_ORDER),
    },
    selected: p.get('lab'),
    query: p.get('q') ?? '',
  };
}
