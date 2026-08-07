import { useMemo, useState } from 'react';

import { LINEAGE_GROUPS, ORGS } from '../../data/taxonomy';
import type { Lab } from '../../data/types';
import { valuationStep } from '../../lib/color';
import { founderNames, labValuationLabel, spaceLabel } from '../../lib/format';
import { lineageGroupsOf } from '../../lib/layout';

interface Props {
  labs: Lab[];
  /** Slugs surviving the current filters and search. */
  visible: Set<string>;
}

type SortKey = 'name' | 'val' | 'year' | 'space' | 'lineage' | 'place';

interface Row {
  lab: Lab;
  step: number;
  /** Sort key for "Came out of" — the lineage groups, coarser than what's shown. */
  lineage: string;
  /** What's actually shown: the founders' prior organisations. */
  priors: string;
  place: string;
  space: string;
}

const COLUMNS: { label: string; sort?: SortKey; numeric?: boolean }[] = [
  { label: 'Company', sort: 'name' },
  { label: 'Valuation', sort: 'val', numeric: true },
  { label: 'Founded', sort: 'year', numeric: true },
  { label: 'Research area', sort: 'space' },
  { label: 'Came out of', sort: 'lineage' },
  { label: 'Founders' },
  { label: 'Based in', sort: 'place' },
  { label: 'Known for' },
];

/** Undisclosed valuations and non-companies sit off the ramp entirely. */
const swatchFill = (row: Row) =>
  row.lab.valuation.qualifier === 'undisclosed' ||
  row.lab.structure === 'subsidiary' ||
  row.lab.structure === 'nonprofit'
    ? 'var(--unknown-fill)'
    : `var(--seq-${row.step})`;

/**
 * Every lab as a sortable table — a view of the explorer's filter state, not a
 * separate page, so a search or filter set means the same thing here as it does
 * on the canvas.
 *
 * All rows are rendered and the filtered-out ones are hidden rather than
 * dropped, which keeps the full inventory in the statically rendered HTML for
 * crawlers no matter which view the page loads in.
 */
export function LabTable({ labs, visible }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
    key: 'val',
    desc: true,
  });

  const rows = useMemo<Row[]>(
    () =>
      labs.map((lab) => ({
        lab,
        step: valuationStep(lab.valuation.usdM),
        lineage: lineageGroupsOf(lab)
          .map((g) => LINEAGE_GROUPS[g].short)
          .join(', '),
        priors: [
          ...new Set(lab.founders.flatMap((f) => f.prior ?? []).map((o) => ORGS[o].label)),
        ].join(', '),
        place: `${lab.location.country} ${lab.location.city}`,
        space: spaceLabel(lab),
      })),
    [labs]
  );

  const sorted = useMemo(() => {
    const valueOf = (r: Row): string | number => {
      switch (sort.key) {
        case 'name':
          return r.lab.name;
        case 'val':
          return r.lab.valuation.usdM;
        case 'year':
          return r.lab.year;
        case 'space':
          return r.space;
        case 'lineage':
          return r.lineage;
        case 'place':
          return r.place;
      }
    };
    // Sort is stable, so equal keys keep source order and the server and client
    // renders agree.
    return [...rows].sort((a, b) => {
      const av = valueOf(a);
      const bv = valueOf(b);
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sort.desc ? -cmp : cmp;
    });
  }, [rows, sort]);

  const onSort = (key: SortKey) =>
    setSort((s) => ({ key, desc: s.key === key ? !s.desc : true }));

  return (
    <div className="table-wrap">
      <div className="table-scroll">
        <table className="labs">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  scope="col"
                  aria-sort={
                    col.sort && sort.key === col.sort
                      ? sort.desc
                        ? 'descending'
                        : 'ascending'
                      : undefined
                  }
                >
                  {col.sort ? (
                    <button type="button" onClick={() => onSort(col.sort!)}>
                      {col.label}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.lab.slug} hidden={!visible.has(r.lab.slug)}>
                <td className="name">
                  <span
                    className="swatch"
                    style={{ background: swatchFill(r) }}
                    aria-hidden="true"
                  />
                  <a href={`/labs/${r.lab.slug}`}>{r.lab.name}</a>
                </td>
                <td className="num">
                  {labValuationLabel(r.lab)}
                  {r.lab.valuation.rumored && (
                    <span className="muted" title="Rumored">
                      {' '}
                      *
                    </span>
                  )}
                </td>
                <td className="num">{r.lab.year}</td>
                <td>{r.space}</td>
                <td>{r.priors || <span className="muted">—</span>}</td>
                <td>{founderNames(r.lab)}</td>
                <td>
                  {r.lab.location.city}
                  <div className="muted table-country">{r.lab.location.country}</div>
                </td>
                <td>{r.lab.knownFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="lab-card-list" aria-label="Neolabs">
        {sorted.map((r) => (
          <a
            key={r.lab.slug}
            className="lab-card"
            href={`/labs/${r.lab.slug}`}
            hidden={!visible.has(r.lab.slug)}
          >
            <header className="lab-card-head">
              <span className="lab-card-name">
                <i className="swatch" style={{ background: swatchFill(r) }} aria-hidden="true" />
                {r.lab.name}
              </span>
              <span className="lab-card-valuation">
                {labValuationLabel(r.lab)}
                {r.lab.valuation.rumored && (
                  <span className="muted" title="Rumored">
                    {' '}
                    *
                  </span>
                )}
              </span>
            </header>
            <dl className="lab-card-facts">
              <div>
                <dt>Founded</dt>
                <dd>{r.lab.year}</dd>
              </div>
              <div>
                <dt>Research area</dt>
                <dd>{r.space}</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>
                  {r.lab.location.city}, {r.lab.location.country}
                </dd>
              </div>
            </dl>
            <p>{r.lab.knownFor}</p>
          </a>
        ))}
      </section>

      <p className="table-empty" hidden={visible.size > 0}>
        No labs match that search.
      </p>
    </div>
  );
}
