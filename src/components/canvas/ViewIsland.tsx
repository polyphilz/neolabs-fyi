import { VIEWS, type ViewId } from '../../lib/layout';

interface Props {
  view: ViewId;
  onChange: (view: ViewId) => void;
}

export function ViewIsland({ view, onChange }: Props) {
  return (
    <div className="island island-views" role="tablist" aria-label="Canvas view">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          role="tab"
          aria-selected={view === v.id}
          title={v.hint}
          className={view === v.id ? 'viewtab is-active' : 'viewtab'}
          onClick={() => onChange(v.id)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
