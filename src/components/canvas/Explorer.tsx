import { useCallback, useEffect, useMemo, useState } from 'react';

import { LAB_BY_SLUG } from '../../data/labs';
import { TAG_ORDER } from '../../data/taxonomy';
import type { Lab, LineageGroup } from '../../data/types';
import type { Basemap } from '../../lib/basemap';
import {
  applyFilters,
  bounds as computeBounds,
  defaultFilters,
  fromParams,
  isDefault,
  toParams,
  type Filters,
} from '../../lib/filters';
import { isCanvasView } from '../../lib/layout';
import { matchesLabSearch } from '../../lib/search';
import { SearchField } from '../SearchField';
import { SiteHeader } from '../SiteHeader';
import { LabTable } from '../table/LabTable';
import { DetailPanel } from './DetailPanel';
import { FilterIsland } from './FilterIsland';
import { LabCanvas } from './LabCanvas';
import { LineageDetailPanel } from './LineageDetailPanel';

interface Props {
  labs: Lab[];
  basemap: Basemap;
}

const VIEW_TITLES: Record<Filters['view'], string> = {
  area: 'Neolabs.fyi | Neolab research areas',
  lineage: 'Neolabs.fyi | Neolab founder lineages',
  geography: 'Neolabs.fyi | Neolab headquarters geography',
  valuation: 'Neolabs.fyi | Neolab valuations',
  table: 'Neolabs.fyi | Every neolab in a sortable table',
};

/**
 * Every view of the dataset over one piece of filter state.
 *
 * The canvas views draw a full-bleed map with the header floating over it; the
 * table view puts the same header on a solid bar above a scrolling table. Both
 * read the same filters, so switching between them never loses a search or a
 * selection — which is the reason the table is a view here rather than a page
 * of its own.
 */
export function Explorer({ labs, basemap }: Props) {
  const bounds = useMemo(() => computeBounds(labs), [labs]);
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(labs));
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLineage, setSelectedLineage] = useState<LineageGroup | null>(null);

  const [hydrated, setHydrated] = useState(false);

  // Hydrate from the URL after mount rather than during render, so the static
  // HTML and the first client render agree.
  useEffect(() => {
    const parsed = fromParams(new URLSearchParams(window.location.search), labs);
    setFilters(parsed.filters);
    setSelected(parsed.selected);
    setQuery(parsed.query);
    setHydrated(true);
  }, [labs]);

  // Mirror state back into the URL so any view is linkable and shareable.
  //
  // Gated on `hydrated`: both effects run in the same commit, and this one would
  // otherwise fire with the pre-hydration defaults still in state and overwrite
  // the very query string the effect above is reading — silently dropping
  // ?lab= and friends on a deep link.
  useEffect(() => {
    if (!hydrated) return;
    const params = toParams(filters, labs, selected, query);
    const search = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}`
    );
    document.title = VIEW_TITLES[filters.view];
  }, [hydrated, filters, labs, selected, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null);
        setSelectedLineage(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (filters.view !== 'lineage') setSelectedLineage(null);
  }, [filters.view]);

  const visible = useMemo(
    () => applyFilters(labs, filters).filter((lab) => matchesLabSearch(lab, query)),
    [labs, filters, query]
  );
  const visibleSlugs = useMemo(() => new Set(visible.map((l) => l.slug)), [visible]);
  const tagsInUse = useMemo(
    () => TAG_ORDER.filter((t) => labs.some((l) => l.tags?.includes(t))),
    [labs]
  );

  const update = useCallback((next: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...next }));
  }, []);

  const reset = useCallback(() => {
    setFilters((current) => ({ ...defaultFilters(labs), view: current.view }));
    setQuery('');
  }, [labs]);

  const selectedLab = selected ? LAB_BY_SLUG.get(selected) ?? null : null;
  const selectLab = useCallback((slug: string | null) => {
    setSelected(slug);
    setSelectedLineage(null);
  }, []);
  const selectLineage = useCallback((group: LineageGroup | null) => {
    setSelected(null);
    setSelectedLineage(group);
  }, []);

  const view = filters.view;

  return (
    <div className="explorer" data-view={view}>
      {/* First in the DOM so it leads the tab order, and so the table view can
          simply stack it above a scrolling body. */}
      <SiteHeader
        floating={isCanvasView(view)}
        view={view}
        onViewChange={(next) => update({ view: next })}
      >
        <SearchField value={query} onChange={setQuery} />
        <FilterIsland
          filters={filters}
          tagsInUse={tagsInUse}
          bounds={bounds}
          shown={visible.length}
          total={labs.length}
          dirty={!isDefault(filters, labs) || Boolean(query)}
          onChange={update}
          onReset={reset}
        />
      </SiteHeader>

      {isCanvasView(view) && (
        <LabCanvas
          labs={visible}
          allLabs={labs}
          basemap={basemap}
          view={view}
          selected={selected}
          selectedLineage={selectedLineage}
          onSelect={selectLab}
          onLineageSelect={selectLineage}
        />
      )}

      {/* Always mounted, so the full inventory is in the static HTML whichever
          view the page loads in. CSS hides it away from the table view. */}
      <div className="table-view">
        <LabTable labs={labs} visible={visibleSlugs} />
      </div>

      <DetailPanel lab={selectedLab} onClose={() => setSelected(null)} />
      <LineageDetailPanel
        group={selectedLineage}
        labs={visible}
        onSelectLab={selectLab}
        onClose={() => setSelectedLineage(null)}
      />

      <span className="sr-only" aria-live="polite">
        {visible.length === labs.length
          ? `${labs.length} labs`
          : `${visible.length} of ${labs.length} labs`}
      </span>
    </div>
  );
}
