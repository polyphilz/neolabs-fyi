import type { ReactNode } from 'react';

import type { ViewId } from '../lib/layout';
import { ThemeToggle } from './ThemeToggle';
import { ViewTabs } from './ViewTabs';
import { Wordmark } from './Wordmark';

interface Props {
  /**
   * Float the header over the canvas instead of resting it on a solid bar.
   * The geometry is identical either way — only the backdrop changes — so
   * moving between the canvas and the table doesn't shift a single control.
   */
  floating?: boolean;
  /** Active view, when the header is showing one. */
  view?: ViewId;
  onViewChange?: (view: ViewId) => void;
  /** Absolute path, used to mark the current site link. */
  currentPath?: string;
  /** Search and filter controls. */
  children?: ReactNode;
}

/**
 * The site header, shared by every page.
 *
 * The explorer renders it from React with live view tabs; the static pages
 * render the same component through Astro with no client directive, so they
 * ship the identical markup and zero JavaScript.
 */
export function SiteHeader({
  floating = false,
  view,
  onViewChange,
  currentPath = '/',
  children,
}: Props) {
  return (
    <header className={floating ? 'site-header is-floating' : 'site-header'}>
      <Wordmark />
      <ViewTabs view={view} onChange={onViewChange} />
      {/* `display: contents` in the single-row layout, so these stay direct flex
          children and the floating header keeps no pointer-catching box between
          islands. In the stacked layouts it becomes a real row of its own —
          which is what stops a widening Filters island from sharing a grid
          column with the site nav and squeezing the tabs above it. */}
      {children && <div className="header-tools">{children}</div>}
      {/* The toggle rides inside the nav island rather than beside it. Every
          stacked layout below places `.island-nav` as a single grid item, so
          growing the island costs nothing structurally — a sibling would have
          needed a column of its own at each breakpoint. */}
      <nav className="island island-nav" aria-label="Site">
        <a href="/about" aria-current={currentPath === '/about' ? 'page' : undefined}>
          About
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
