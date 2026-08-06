import { useEffect, useMemo, useRef, useState } from 'react';

import { DOMAINS, DOMAIN_ORDER, LINEAGE_GROUPS, LINEAGE_ORDER } from '../../data/taxonomy';
import type { DomainId, Lab, LineageGroup } from '../../data/types';
import {
  applyFilters,
  bounds as computeBounds,
  defaultFilters,
  isDefault,
  type Filters,
} from '../../lib/filters';
import { founderNames, money, spaceLabel } from '../../lib/format';
import { lineageGroupsOf } from '../../lib/layout';
import { RangeSlider } from '../canvas/RangeSlider';

interface Props {
  labs: Lab[];
}

/** Log-scaled control, same as the map — valuation spans $150M to $100B. */
const SLIDER_STEPS = 240;
const toSlider = (v: number, lo: number, hi: number) =>
  Math.round(((Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))) * SLIDER_STEPS);
const fromSlider = (pos: number, lo: number, hi: number) =>
  Math.exp(Math.log(lo) + (pos / SLIDER_STEPS) * (Math.log(hi) - Math.log(lo)));

const toggle = <T,>(list: T[], v: T): T[] =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

/**
 * Filter controls for the static table.
 *
 * Deliberately shares `Filters` and `applyFilters` with the canvas rather than
 * reimplementing them, so "Robotics, >$1B, ex-DeepMind" means exactly the same
 * thing in both places. The table itself stays server-rendered HTML; this only
 * toggles row visibility.
 */
export function TableControls({ labs }: Props) {
  const bounds = useMemo(() => computeBounds(labs), [labs]);
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(labs));
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /** Everything a search should match, built once. */
  const haystack = useMemo(() => {
    const map = new Map<string, string>();
    for (const lab of labs) {
      map.set(
        lab.slug,
        [
          lab.name,
          spaceLabel(lab),
          DOMAINS[lab.domain].label,
          founderNames(lab),
          lineageGroupsOf(lab).map((g) => LINEAGE_GROUPS[g].label).join(' '),
          lab.location.city,
          lab.location.country,
          lab.knownFor,
          String(lab.year),
        ]
          .join(' ')
          .toLowerCase()
      );
    }
    return map;
  }, [labs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const passed = applyFilters(labs, filters).filter(
      (lab) => !q || (haystack.get(lab.slug) ?? '').includes(q)
    );
    return new Set(passed.map((l) => l.slug));
  }, [labs, filters, query, haystack]);

  // The table is static HTML; show and hide its rows in place.
  useEffect(() => {
    const rows = document.querySelectorAll<HTMLTableRowElement>('#labs-table tbody tr[data-slug]');
    rows.forEach((row) => {
      row.hidden = !visible.has(row.dataset.slug ?? '');
    });
    const empty = document.getElementById('labs-empty');
    if (empty) empty.hidden = visible.size > 0;
  }, [visible]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const update = (next: Partial<Filters>) => setFilters((f) => ({ ...f, ...next }));
  const dirty = !isDefault(filters, labs);
  const activeCount = filters.domains.length + filters.lineage.length;

  return (
    <div className="table-controls">
      <div className="search">
        <svg className="search-icon" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Search labs, founders, cities…"
          autoComplete="off"
          aria-label="Search the table"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
        />
      </div>

      <div className="island-wrap" ref={rootRef}>
        <button
          type="button"
          className={open ? 'filter-btn is-active' : 'filter-btn'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="filter-icon">
            <path
              d="M2 4h12M4.5 8h7M7 12h2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          Filter
          {activeCount > 0 && <span className="pip">{activeCount}</span>}
        </button>

        {open && (
          <div className="panel panel-left" role="group" aria-label="Filters">
            <RangeSlider
              label="Valuation"
              steps={SLIDER_STEPS}
              min={toSlider(filters.minUsdM, bounds.minUsdM, bounds.maxUsdM)}
              max={toSlider(filters.maxUsdM, bounds.minUsdM, bounds.maxUsdM)}
              lowLabel={money(filters.minUsdM)}
              highLabel={money(filters.maxUsdM)}
              onChange={(lo, hi) =>
                update({
                  minUsdM:
                    lo === 0
                      ? bounds.minUsdM
                      : Math.round(fromSlider(lo, bounds.minUsdM, bounds.maxUsdM)),
                  maxUsdM:
                    hi === SLIDER_STEPS
                      ? bounds.maxUsdM
                      : Math.round(fromSlider(hi, bounds.minUsdM, bounds.maxUsdM)),
                })
              }
            />

            <RangeSlider
              label="Founded"
              steps={bounds.maxYear - bounds.minYear}
              min={filters.minYear - bounds.minYear}
              max={filters.maxYear - bounds.minYear}
              lowLabel={String(filters.minYear)}
              highLabel={String(filters.maxYear)}
              onChange={(lo, hi) =>
                update({ minYear: bounds.minYear + lo, maxYear: bounds.minYear + hi })
              }
            />

            <ChipGroup
              label="Research area"
              options={DOMAIN_ORDER.map((d) => ({ id: d, label: DOMAINS[d].label }))}
              selected={filters.domains}
              onToggle={(id) => update({ domains: toggle(filters.domains, id as DomainId) })}
            />
            <ChipGroup
              label="Came out of"
              options={LINEAGE_ORDER.map((g) => ({ id: g, label: LINEAGE_GROUPS[g].short }))}
              selected={filters.lineage}
              onToggle={(id) => update({ lineage: toggle(filters.lineage, id as LineageGroup) })}
            />
          </div>
        )}
      </div>

      {(dirty || query) && (
        <button
          type="button"
          className="reset"
          onClick={() => {
            setFilters(defaultFilters(labs));
            setQuery('');
          }}
        >
          Reset
        </button>
      )}

      <p className="table-count" aria-live="polite">
        {visible.size === labs.length ? `${labs.length} labs` : `${visible.size} of ${labs.length} labs`}
      </p>
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="chipgroup">
      <legend className="range-label">{label}</legend>
      <div className="chips">
        {options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              className={on ? 'chip is-on' : 'chip'}
              onClick={() => onToggle(o.id)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
