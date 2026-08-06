import { useEffect, useMemo, useRef, useState } from 'react';

import { DOMAINS, DOMAIN_ORDER, LINEAGE_GROUPS, LINEAGE_ORDER, TAGS, TAG_ORDER } from '../../data/taxonomy';
import type { DomainId, Lab, LineageGroup, TagId } from '../../data/types';
import {
  applyFilters,
  bounds as computeBounds,
  defaultFilters,
  isDefault,
  type Filters,
} from '../../lib/filters';
import { money } from '../../lib/format';
import { matchesLabSearch } from '../../lib/search';
import { RangeSlider } from '../canvas/RangeSlider';
import { SearchField } from '../SearchField';

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

  /** Only offer tags something actually carries, so the group stays empty
      until the data is populated. */
  const tagsInUse = useMemo(
    () => TAG_ORDER.filter((t) => labs.some((l) => l.tags?.includes(t))),
    [labs]
  );

  const visible = useMemo(() => {
    const passed = applyFilters(labs, filters).filter((lab) => matchesLabSearch(lab, query));
    return new Set(passed.map((l) => l.slug));
  }, [labs, filters, query]);

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
  const chipCount = filters.domains.length + filters.lineage.length + filters.tags.length;
  const activeCount = chipCount || (dirty || query ? 1 : 0);

  return (
    <div className="table-controls">
      <SearchField value={query} onChange={setQuery} ariaLabel="Search the table" />

      <div className="island-wrap" ref={rootRef}>
        <div className="island island-filters">
          <button
            type="button"
            className={open ? 'island-btn is-active' : 'island-btn'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            Filters
            {activeCount > 0 && <span className="pip">{activeCount}</span>}
          </button>
          <span className="island-count">
            <strong>{visible.size}</strong>
            <span className="island-count-total">/{labs.length}</span>
          </span>
          {(dirty || query) && (
            <button
              type="button"
              className="island-btn island-btn-quiet"
              onClick={() => {
                setFilters(defaultFilters(labs));
                setQuery('');
              }}
            >
              Reset
            </button>
          )}
        </div>

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
            {tagsInUse.length > 0 && (
              <ChipGroup
                label="Tags"
                options={tagsInUse.map((t) => ({ id: t, label: TAGS[t] }))}
                selected={filters.tags}
                onToggle={(id) => update({ tags: toggle(filters.tags, id as TagId) })}
              />
            )}
          </div>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        {visible.size === labs.length ? `${labs.length} labs` : `${visible.size} of ${labs.length} labs`}
      </span>
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
