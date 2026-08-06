interface Props {
  label: string;
  /** Position values, 0..steps. */
  min: number;
  max: number;
  steps: number;
  /** Rendered bounds, already formatted. */
  lowLabel: string;
  highLabel: string;
  onChange: (min: number, max: number) => void;
}

/**
 * Two stacked native range inputs. Less pretty than a custom-drawn track, but
 * it's keyboard-operable and screen-reader-labelled for free, which a div with
 * pointer handlers is not.
 */
export function RangeSlider({ label, min, max, steps, lowLabel, highLabel, onChange }: Props) {
  const pctLow = (min / steps) * 100;
  const pctHigh = (max / steps) * 100;

  /**
   * Both inputs span the whole track, so where the thumbs coincide only the one
   * painted on top is grabbable. The max input is later in the DOM, so it wins
   * by default — which deadlocks at the top of the range: max can't move right
   * (already at the ceiling) and its clamp won't let it move left past min,
   * while min is buried underneath and unreachable.
   *
   * Fix: when the thumbs coincide, put whichever one still has somewhere to go
   * on top. Near the ceiling that's min (draggable left); near the floor the
   * default max (draggable right) is already correct.
   */
  const minOnTop = min === max && min > steps / 2;

  return (
    <div className="range">
      <div className="range-head">
        <span className="range-label">{label}</span>
        <span className="range-value">
          {lowLabel} — {highLabel}
        </span>
      </div>
      <div className="range-track-wrap">
        <div className="range-track" />
        <div
          className="range-fill"
          style={{ left: `${pctLow}%`, width: `${Math.max(0, pctHigh - pctLow)}%` }}
        />
        <input
          type="range"
          min={0}
          max={steps}
          value={min}
          style={minOnTop ? { zIndex: 2 } : undefined}
          aria-label={`${label}, minimum`}
          onChange={(e) => onChange(Math.min(Number(e.target.value), max), max)}
        />
        <input
          type="range"
          min={0}
          max={steps}
          value={max}
          style={minOnTop ? undefined : { zIndex: 2 }}
          aria-label={`${label}, maximum`}
          onChange={(e) => onChange(min, Math.max(Number(e.target.value), min))}
        />
      </div>
    </div>
  );
}
