import type { Filters } from '../../lib/filters';
import { RangeSlider } from './RangeSlider';

interface Props {
  filters: Filters;
  bounds: { minYear: number; maxYear: number };
  onChange: (next: Partial<Filters>) => void;
}

export function TimelineIsland({ filters, bounds, onChange }: Props) {
  return (
    <div className="island island-timeline">
      <RangeSlider
        label="Founded"
        steps={bounds.maxYear - bounds.minYear}
        min={filters.minYear - bounds.minYear}
        max={filters.maxYear - bounds.minYear}
        lowLabel={String(filters.minYear)}
        highLabel={String(filters.maxYear)}
        onChange={(lo, hi) =>
          onChange({ minYear: bounds.minYear + lo, maxYear: bounds.minYear + hi })
        }
      />
    </div>
  );
}
