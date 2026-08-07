import { useEffect, useRef, useState } from 'react';

import { VIEWS, type ViewId } from '../lib/layout';

interface Props {
  /** The active view. Pages that aren't the explorer leave this unset. */
  view?: ViewId;
  /**
   * Present only on the explorer, where picking a view is a state change rather
   * than a navigation. Its absence is what switches the tabs to plain links.
   */
  onChange?: (view: ViewId) => void;
}

/** The research view is the default, so it owns the bare URL. */
const hrefFor = (id: ViewId) => (id === 'area' ? '/' : `/?view=${id}`);

/**
 * Which edges have tabs hidden beyond them, and so should fade out. `none` is
 * distinct from unset: unset means nothing is managing this strip, which is how
 * the stylesheet knows to fall back to a width-based guess on the static pages.
 */
type Fade = 'start' | 'end' | 'both' | 'none' | null;

/**
 * The one view switcher.
 *
 * Every tab carries `data-label` so the stylesheet can reserve the width of its
 * semibold state — without that, activating a view re-measures the strip and
 * nudges every other tab sideways.
 */
export function ViewTabs({ view, onChange }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState<Fade>(null);

  // On a narrow screen the strip scrolls, and the selected tab can start out
  // past its right edge — including on first load of a ?view= deep link.
  useEffect(() => {
    track.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [view]);

  // Below roughly 390px five tabs genuinely don't fit, so the strip scrolls.
  // Fading the edge it can scroll towards is what distinguishes that from a tab
  // simply being sliced in half.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const slack = el.scrollWidth - el.clientWidth;
      if (slack <= 1) return setFade('none');
      const atStart = el.scrollLeft <= 1;
      const atEnd = el.scrollLeft >= slack - 1;
      setFade(atStart ? 'end' : atEnd ? 'start' : 'both');
    };
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, []);

  const tabs = onChange
    ? VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          role="tab"
          aria-selected={view === v.id}
          title={v.hint}
          data-label={v.label}
          className={view === v.id ? 'viewtab is-active' : 'viewtab'}
          onClick={() => onChange(v.id)}
        >
          <span>{v.label}</span>
        </button>
      ))
    : VIEWS.map((v) => (
        <a key={v.id} className="viewtab" href={hrefFor(v.id)} data-label={v.label} title={v.hint}>
          <span>{v.label}</span>
        </a>
      ));

  // The capsule is the shell; the track inside it is what scrolls and what the
  // fade masks, so the capsule's own border stays crisp. A tablist has to own
  // its tabs directly, so that role goes on the track rather than the shell.
  return onChange ? (
    <div className="island island-views">
      <div
        className="viewtab-track"
        role="tablist"
        aria-label="Views"
        ref={track}
        data-fade={fade ?? undefined}
      >
        {tabs}
      </div>
    </div>
  ) : (
    <nav className="island island-views" aria-label="Views">
      <div className="viewtab-track" ref={track} data-fade={fade ?? undefined}>
        {tabs}
      </div>
    </nav>
  );
}
