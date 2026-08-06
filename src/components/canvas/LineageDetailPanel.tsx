import { LINEAGE_GROUPS } from "../../data/taxonomy";
import type { Lab, LineageGroup } from "../../data/types";
import { spaceLabel, valuationLabel } from "../../lib/format";
import { lineageGroupsOf } from "../../lib/layout";

interface Props {
  group: LineageGroup | null;
  labs: Lab[];
  onSelectLab: (slug: string) => void;
  onClose: () => void;
}

export function LineageDetailPanel({
  group,
  labs,
  onSelectLab,
  onClose,
}: Props) {
  if (!group) return null;

  const connected = labs
    .filter((lab) => lineageGroupsOf(lab).includes(group))
    .sort(
      (a, b) =>
        b.valuation.usdM - a.valuation.usdM || a.name.localeCompare(b.name),
    );
  const label = LINEAGE_GROUPS[group].label;

  return (
    <>
      <button
        type="button"
        className="drawer-backdrop"
        aria-label="Close lineage details"
        onClick={onClose}
      />
      <aside className="drawer" aria-label={`${label} lineage details`}>
        <button
          type="button"
          className="drawer-close"
          onClick={onClose}
          aria-label="Close details"
        >
          ×
        </button>

        <header className="drawer-head">
          <h2>{label} lineage</h2>
          <span className="badge badge-quiet">
            {connected.length} {connected.length === 1 ? "lab" : "labs"}
          </span>
        </header>

        <p className="drawer-known">
          Labs whose founding teams came out of {label}.
        </p>

        <h3 className="drawer-subhead">Connected labs</h3>
        <ul className="lineage-labs">
          {connected.map((lab) => (
            <li key={lab.slug}>
              <button type="button" onClick={() => onSelectLab(lab.slug)}>
                <span className="lineage-lab-name">{lab.name}</span>
                <span className="lineage-lab-meta">
                  {valuationLabel(lab.valuation)} · {spaceLabel(lab)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
