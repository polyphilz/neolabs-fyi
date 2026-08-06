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
import { Wordmark } from '../Wordmark';
import { DetailPanel } from './DetailPanel';
import { FilterIsland } from './FilterIsland';
import { LabCanvas } from './LabCanvas';
import { LineageDetailPanel } from './LineageDetailPanel';
import { TimelineIsland } from './TimelineIsland';
import { ViewIsland } from './ViewIsland';

interface Props {
  labs: Lab[];
  basemap: Basemap;
}

const VIEW_TITLES: Record<Filters['view'], string> = {
  area: 'Neolabs.fyi | Neolab research areas',
  lineage: 'Neolabs.fyi | Neolab founder lineages',
  geography: 'Neolabs.fyi | Neolab headquarters geography',
  valuation: 'Neolabs.fyi | Neolab valuations',
};

/**
 * Full-bleed canvas with floating control islands over it. The islands are
 * pointer-transparent containers holding pointer-opaque children, so the canvas
 * stays draggable everywhere except directly on a control.
 */
export function Explorer({ labs, basemap }: Props) {
  const bounds = useMemo(() => computeBounds(labs), [labs]);
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(labs));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLineage, setSelectedLineage] = useState<LineageGroup | null>(null);

  const [hydrated, setHydrated] = useState(false);

  // Hydrate from the URL after mount rather than during render, so the static
  // HTML and the first client render agree.
  useEffect(() => {
    const parsed = fromParams(new URLSearchParams(window.location.search), labs);
    setFilters(parsed.filters);
    setSelected(parsed.selected);
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
    const params = toParams(filters, labs, selected);
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    document.title = VIEW_TITLES[filters.view];
  }, [hydrated, filters, labs, selected]);

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

  const visible = useMemo(() => applyFilters(labs, filters), [labs, filters]);
  const tagsInUse = useMemo(
    () => TAG_ORDER.filter((t) => labs.some((l) => l.tags?.includes(t))),
    [labs]
  );

  const update = useCallback((next: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...next }));
  }, []);

  const reset = useCallback(
    () => setFilters((current) => ({ ...defaultFilters(labs), view: current.view })),
    [labs]
  );

  const selectedLab = selected ? LAB_BY_SLUG.get(selected) ?? null : null;
  const selectLab = useCallback((slug: string | null) => {
    setSelected(slug);
    setSelectedLineage(null);
  }, []);
  const selectLineage = useCallback((group: LineageGroup | null) => {
    setSelected(null);
    setSelectedLineage(group);
  }, []);

  return (
    <div className="explorer">
      <LabCanvas
        labs={visible}
        allLabs={labs}
        basemap={basemap}
        filters={filters}
        selected={selected}
        selectedLineage={selectedLineage}
        onSelect={selectLab}
        onLineageSelect={selectLineage}
      />

      <div className="hud hud-top">
        <Wordmark />
        <ViewIsland view={filters.view} onChange={(view) => update({ view })} />
        <FilterIsland
          filters={filters}
          tagsInUse={tagsInUse}
          bounds={bounds}
          shown={visible.length}
          total={labs.length}
          dirty={!isDefault(filters, labs)}
          onChange={update}
          onReset={reset}
        />
        <nav className="island island-nav">
          <a href="/table">Table</a>
          <a href="/about">About</a>
        </nav>
      </div>

      <div className="hud hud-bottom-left">
        <TimelineIsland filters={filters} bounds={bounds} onChange={update} />
      </div>

      <DetailPanel lab={selectedLab} onClose={() => setSelected(null)} />
      <LineageDetailPanel
        group={selectedLineage}
        labs={visible}
        onSelectLab={selectLab}
        onClose={() => setSelectedLineage(null)}
      />
    </div>
  );
}
