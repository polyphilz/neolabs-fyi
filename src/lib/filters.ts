import { DOMAIN_ORDER, LINEAGE_ORDER } from '../data/taxonomy';
import type { DomainId, Lab, LineageGroup } from '../data/types';
import { lineageGroupsOf, type ViewId } from './layout';

export interface Filters {
  view: ViewId;
  /** Valuation bounds in millions USD. */
  minUsdM: number;
  maxUsdM: number;
  minYear: number;
  maxYear: number;
  /** Empty means "all" — an explicit empty selection would show nothing. */
  domains: DomainId[];
  lineage: LineageGroup[];
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
  return { view: 'valuation', ...b, domains: [], lineage: [] };
}

export function applyFilters(labs: Lab[], f: Filters): Lab[] {
  return labs.filter((lab) => {
    if (lab.valuation.usdM < f.minUsdM || lab.valuation.usdM > f.maxUsdM) return false;
    if (lab.year < f.minYear || lab.year > f.maxYear) return false;
    if (f.domains.length && !f.domains.includes(lab.domain)) return false;
    if (f.lineage.length && !lineageGroupsOf(lab).some((g) => f.lineage.includes(g))) return false;
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
    !f.domains.length &&
    !f.lineage.length
  );
}

// ---------------------------------------------------------------------------
// URL round-tripping — every filter state is a shareable, linkable page
// ---------------------------------------------------------------------------

export function toParams(f: Filters, labs: Lab[], selected: string | null): URLSearchParams {
  const b = bounds(labs);
  const p = new URLSearchParams();
  if (f.view !== 'valuation') p.set('view', f.view);
  if (f.minUsdM !== b.minUsdM) p.set('vmin', String(f.minUsdM));
  if (f.maxUsdM !== b.maxUsdM) p.set('vmax', String(f.maxUsdM));
  if (f.minYear !== b.minYear) p.set('ymin', String(f.minYear));
  if (f.maxYear !== b.maxYear) p.set('ymax', String(f.maxYear));
  if (f.domains.length) p.set('area', f.domains.join(','));
  if (f.lineage.length) p.set('from', f.lineage.join(','));
  if (selected) p.set('lab', selected);
  return p;
}

const VIEW_IDS: ViewId[] = ['valuation', 'lineage', 'geography', 'area'];

export function fromParams(
  p: URLSearchParams,
  labs: Lab[]
): { filters: Filters; selected: string | null } {
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
      minUsdM: num('vmin', base.minUsdM),
      maxUsdM: num('vmax', base.maxUsdM),
      minYear: num('ymin', base.minYear),
      maxYear: num('ymax', base.maxYear),
      domains: list('area', DOMAIN_ORDER),
      lineage: list('from', LINEAGE_ORDER),
    },
    selected: p.get('lab'),
  };
}
