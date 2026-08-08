import { useEffect, useRef, useState } from "react";

import {
  DOMAINS,
  DOMAIN_ORDER,
  LINEAGE_GROUPS,
  LINEAGE_ORDER,
  TAGS,
} from "../../data/taxonomy";
import type { DomainId, LineageGroup, TagId } from "../../data/types";
import { VALUATION_BUCKETS } from "../../lib/color";
import type { Filters } from "../../lib/filters";
import { money } from "../../lib/format";
import { RangeSlider } from "./RangeSlider";

interface Props {
  filters: Filters;
  /** Tags present in the dataset; the group hides when there are none. */
  tagsInUse: TagId[];
  bounds: {
    minUsdM: number;
    maxUsdM: number;
    minYear: number;
    maxYear: number;
  };
  shown: number;
  total: number;
  dirty: boolean;
  onChange: (next: Partial<Filters>) => void;
  onReset: () => void;
}

/**
 * Valuation spans several orders of magnitude, so a linear slider would spend
 * nearly all of its travel at the top. The control is always log-scaled; only
 * the categorical canvas views use that compression in their size encoding.
 */
const SLIDER_STEPS = 240;

const toSlider = (usdM: number, lo: number, hi: number) =>
  Math.round(
    ((Math.log(usdM) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))) *
      SLIDER_STEPS,
  );

const fromSlider = (pos: number, lo: number, hi: number) =>
  Math.exp(Math.log(lo) + (pos / SLIDER_STEPS) * (Math.log(hi) - Math.log(lo)));

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function FilterIsland({
  filters,
  tagsInUse,
  bounds,
  shown,
  total,
  dirty,
  onChange,
  onReset,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape, the way a menu is expected to behave.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("has-sheet");
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("has-sheet");
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const chipCount =
    filters.domains.length + filters.lineage.length + filters.tags.length;
  const activeCount = chipCount || (dirty ? 1 : 0);
  const categoricalView =
    filters.view === "area" ||
    filters.view === "lineage" ||
    filters.view === "geography";
  const logSizing = categoricalView && filters.sizeScale === "log";

  return (
    <div className="island-wrap" ref={rootRef}>
      <div className="island island-filters">
        <button
          type="button"
          className={open ? "island-btn is-active" : "island-btn"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          Filters
          <span className={activeCount > 0 ? "pip" : "pip is-idle"}>
            {activeCount}
          </span>
        </button>
        <span className="island-count">
          <strong>{shown}</strong>
          <span className="island-count-total">/{total}</span>
        </span>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="sheet-backdrop"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div
            className="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            <div className="sheet-head">
              <strong>Filters</strong>
              <div>
                <button
                  type="button"
                  className="sheet-action"
                  disabled={!dirty}
                  onClick={onReset}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="sheet-action sheet-action-primary"
                  onClick={() => setOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
            <RangeSlider
              label="Valuation"
              steps={SLIDER_STEPS}
              min={toSlider(filters.minUsdM, bounds.minUsdM, bounds.maxUsdM)}
              max={toSlider(filters.maxUsdM, bounds.minUsdM, bounds.maxUsdM)}
              lowLabel={money(filters.minUsdM)}
              highLabel={money(filters.maxUsdM)}
              onChange={(lo, hi) =>
                onChange({
                  minUsdM:
                    lo === 0
                      ? bounds.minUsdM
                      : Math.round(
                          fromSlider(lo, bounds.minUsdM, bounds.maxUsdM),
                        ),
                  maxUsdM:
                    hi === SLIDER_STEPS
                      ? bounds.maxUsdM
                      : Math.round(
                          fromSlider(hi, bounds.minUsdM, bounds.maxUsdM),
                        ),
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
                onChange({
                  minYear: bounds.minYear + lo,
                  maxYear: bounds.minYear + hi,
                })
              }
            />

            {categoricalView && (
              <label className="size-scale-toggle">
                <span className="size-scale-copy">
                  <strong>Regular valuation scale</strong>
                  <small>Match bubble areas to the Valuation view</small>
                </span>
                <input
                  type="checkbox"
                  checked={filters.sizeScale === "valuation"}
                  onChange={(event) =>
                    onChange({
                      sizeScale: event.currentTarget.checked
                        ? "valuation"
                        : "log",
                    })
                  }
                />
                <span className="size-scale-control" aria-hidden="true" />
              </label>
            )}

            <div className="panel-legend">
              <span className="range-label">
                {filters.view === "valuation" ||
                (categoricalView && filters.sizeScale === "valuation")
                  ? "Size & colour = valuation"
                  : filters.view === "table"
                    ? "Valuation"
                    : "Size = log valuation · colour = valuation"}
              </span>
              <div className="legend-ramp" aria-hidden="true">
                {VALUATION_BUCKETS.map((label, i) => (
                  <span
                    key={label}
                    style={{ background: `var(--seq-${i})` }}
                    title={label}
                  />
                ))}
              </div>
              <div className="legend-ends">
                <span>{VALUATION_BUCKETS[0]}</span>
                <span>{VALUATION_BUCKETS[VALUATION_BUCKETS.length - 1]}</span>
              </div>
              <p className="legend-note">
                <i aria-hidden="true" />
                {logSizing
                  ? " Grey = undisclosed · neutral size"
                  : " Grey = valuation not disclosed"}
              </p>
            </div>

            <ChipGroup
              label="Research area"
              options={DOMAIN_ORDER.map((d) => ({
                id: d,
                label: DOMAINS[d].short ?? DOMAINS[d].label,
                title: DOMAINS[d].label,
              }))}
              selected={filters.domains}
              onToggle={(id) =>
                onChange({ domains: toggle(filters.domains, id as DomainId) })
              }
            />
            <ChipGroup
              label="Came out of"
              options={LINEAGE_ORDER.map((g) => ({
                id: g,
                label: LINEAGE_GROUPS[g].short,
              }))}
              selected={filters.lineage}
              onToggle={(id) =>
                onChange({
                  lineage: toggle(filters.lineage, id as LineageGroup),
                })
              }
            />
            {tagsInUse.length > 0 && (
              <ChipGroup
                label="Tags"
                options={tagsInUse.map((t) => ({ id: t, label: TAGS[t] }))}
                selected={filters.tags}
                onToggle={(id) =>
                  onChange({ tags: toggle(filters.tags, id as TagId) })
                }
              />
            )}
          </div>
        </>
      )}
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
  /** `title` carries the unabbreviated name when `label` is a shortened chip form. */
  options: { id: string; label: string; title?: string }[];
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
              title={o.title}
              aria-label={o.title}
              className={on ? "chip is-on" : "chip"}
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
