import { PEOPLE } from "../../data/people";
import { ORGS, STRUCTURE_LABEL } from "../../data/taxonomy";
import type { Lab } from "../../data/types";
import {
  foundersByLastName,
  spaceLabel,
  valuationCaveat,
  valuationLabel,
} from "../../lib/format";

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
  const caveat = valuationCaveat(lab);
  const founders = foundersByLastName(lab);

  return (
    <>
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Close details"
        onClick={onClose}
      />
      <aside className="drawer" aria-label={`${lab.name} details`}>
        <button
          type="button"
          className="drawer-close"
          onClick={onClose}
          aria-label="Close details"
        >
          ×
        </button>

        <header className="drawer-head">
          <h2>{lab.name}</h2>
          {lab.exit && (
            <span className="badge badge-quiet">
              {lab.exit.type === "shutdown"
                ? "Shut down"
                : lab.exit.absorbed
                  ? `Acquired by ${lab.exit.to}`
                  : `Partly acquihired by ${lab.exit.to}`}
            </span>
          )}
          {lab.status === "public" && (
            <span className="badge badge-quiet">Listed</span>
          )}
          {lab.structure && (
            <span className="badge badge-quiet">
              {STRUCTURE_LABEL[lab.structure]}
            </span>
          )}
        </header>

        <p className="drawer-valuation">{valuationLabel(lab.valuation)}</p>
        {caveat && <p className="drawer-caveat">{caveat}</p>}

        <dl className="drawer-facts">
          <div>
            <dt>Research area</dt>
            <dd>{spaceLabel(lab)}</dd>
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
          {founders.map((f) => (
            <li key={f.person}>
              <span className="founder-name">
                {PEOPLE[f.person].name}
                {f.departed && <span className="muted"> (departed)</span>}
                {f.isBacker && <span className="muted"> (backer)</span>}
              </span>
              {f.prior?.length ? (
                <span className="founder-prior">
                  {f.prior.map((o) => ORGS[o].label).join(" · ")}
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
    </>
  );
}
