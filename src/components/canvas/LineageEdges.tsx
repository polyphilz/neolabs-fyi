import { memo, useMemo } from 'react';

import type { LineageGroup } from '../../data/types';
import type { LineageRail } from '../../lib/layout';
import { stable } from '../../lib/precision';
import type { SimNode } from './useSimulation';

interface EdgeDatum {
  from: string;
  toGroup: LineageGroup;
}

interface Props {
  edges: EdgeDatum[];
  rail: LineageRail;
  positions: Map<string, SimNode>;
  groupsBySlug: Map<string, LineageGroup[]>;
  activeLab: string | null;
  activeGroup: LineageGroup | null;
  /** Mutable simulation nodes need an explicit revision to cross memo(). */
  frame: number;
}

/**
 * The lineage field used to render one React element per connection and then
 * change every element's class and marker on hover. These four compound paths
 * keep the same geometry while reducing the entire edge layer to four moving
 * attributes: base, secondary, live, and arrowheads.
 */
export const LineageEdges = memo(function LineageEdges({
  edges,
  rail,
  positions,
  groupsBySlug,
  activeLab,
  activeGroup,
  frame,
}: Props) {
  const rowById = useMemo(
    () => new Map(rail.rows.map((row) => [row.id, row])),
    [rail.rows]
  );

  const geometry = useMemo(() => {
    const items: { edge: EdgeDatum; d: string; x2: number; y2: number }[] = [];
    for (const edge of edges) {
      const node = positions.get(edge.from);
      const row = rowById.get(edge.toGroup);
      if (!node || !row) continue;

      const x2 = node.x - node.r - 3;
      items.push({
        edge,
        d: edgePath(rail.anchorX, row.y, x2, node.y),
        x2,
        y2: node.y,
      });
    }
    return { items, base: items.map((item) => item.d).join(' ') };
    // SimNode positions mutate in place, so frame is intentionally a dependency.
  }, [edges, frame, positions, rail.anchorX, rowById]);

  const focusPaths = useMemo(() => {
    const live: string[] = [];
    const secondary: string[] = [];
    const arrowheads: string[] = [];
    const arrowedLabs = new Set<string>();

    for (const { edge, d, x2, y2 } of geometry.items) {
      const isLive = activeLab === edge.from || activeGroup === edge.toGroup;
      if (isLive) {
        live.push(d);
        // Several live edges can terminate at the same lab. Their old SVG
        // markers overlapped exactly, so paint one equivalent arrowhead.
        if (!arrowedLabs.has(edge.from)) {
          arrowheads.push(arrowPath(x2, y2));
          arrowedLabs.add(edge.from);
        }
        continue;
      }

      if (activeGroup && groupsBySlug.get(edge.from)?.includes(activeGroup)) {
        secondary.push(d);
      }
    }

    return {
      live: live.join(' '),
      secondary: secondary.join(' '),
      arrowheads: arrowheads.join(' '),
    };
  }, [activeGroup, activeLab, geometry.items, groupsBySlug]);

  return (
    <g
      className={`lineage-edges${activeLab || activeGroup ? ' has-focus' : ''}`}
      aria-hidden="true"
    >
      <path className="edge edge-base" d={geometry.base} />
      <path className="edge edge-secondary" d={focusPaths.secondary} />
      <path className="edge edge-live" d={focusPaths.live} />
      <path className="edge-arrowheads" d={focusPaths.arrowheads} />
    </g>
  );
});

/** Rail row to lab, as a curve that leaves and arrives horizontally. */
function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const bend = Math.max(40, (x2 - x1) * 0.42);
  return `M ${stable(x1)} ${stable(y1)} C ${stable(x1 + bend)} ${stable(y1)}, ${stable(x2 - bend)} ${stable(y2)}, ${stable(x2)} ${stable(y2)}`;
}

/** Same right-pointing silhouette as the former marker, baked into one path. */
function arrowPath(x: number, y: number): string {
  return `M ${stable(x)} ${stable(y)} L ${stable(x - 7)} ${stable(y - 3.2)} L ${stable(x - 7)} ${stable(y + 3.2)} Z`;
}
