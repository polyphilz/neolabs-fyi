import { DOMAINS, ORGS } from '../../data/taxonomy';
import type { Lab } from '../../data/types';
import { spaceLabel, valuationCaveat, valuationLabel } from '../../lib/format';

interface Props {
  lab: Lab | null;
  onClose: () => void;
}

/**
 * The drawer shows the same fields as /labs/[slug]; the static page is the
 * canonical, crawlable version and the drawer is the in-canvas preview of it.
 */
export function DetailPanel({ lab, onClose }: Props) {
  if (!lab) return null;
  const caveat = valuationCaveat(lab.valuation);

  return (
    <aside className="drawer" aria-label={`${lab.name} details`}>
      <button type="button" className="drawer-close" onClick={onClose} aria-label="Close details">
        ×
      </button>

      <header className="drawer-head">
        <h2>{lab.name}</h2>
        {lab.status === 'acquihired' && <span className="badge badge-quiet">Acquihired</span>}
        {lab.status === 'public' && <span className="badge badge-quiet">Listed</span>}
      </header>

      <p className="drawer-valuation">
        {valuationLabel(lab.valuation)}
        {lab.valuation.rising && <span className="rising" title="Valuation rose in the last round">↑</span>}
      </p>
      {caveat && <p className="drawer-caveat">{caveat}</p>}

      <dl className="drawer-facts">
        <div>
          <dt>Research area</dt>
          <dd>
            {spaceLabel(lab)}
            <span className="muted"> · {DOMAINS[lab.domain].label}</span>
          </dd>
        </div>
        <div>
          <dt>Founded</dt>
          <dd>{lab.year}</dd>
        </div>
        <div>
          <dt>Based in</dt>
          <dd>
            {lab.location.city}, {lab.location.country}
          </dd>
        </div>
      </dl>

      <h3 className="drawer-subhead">Founders</h3>
      <ul className="founders">
        {lab.founders.map((f) => (
          <li key={f.name}>
            <span className="founder-name">{f.name}</span>
            {f.prior?.length ? (
              <span className="founder-prior">
                {f.prior.map((o) => ORGS[o].label).join(' · ')}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="drawer-known">{lab.knownFor}</p>

      <a className="drawer-link" href={`/labs/${lab.slug}`}>
        Full profile →
      </a>
    </aside>
  );
}
