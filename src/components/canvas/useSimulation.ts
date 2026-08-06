import { useEffect, useRef, useState } from 'react';
import { forceCollide, forceSimulation, forceX, forceY, type Simulation } from 'd3-force';

import type { Lab } from '../../data/types';
import { VIEW_H, VIEW_W, radiusFor, type LayoutResult } from '../../lib/layout';

export interface SimNode {
  slug: string;
  lab: Lab;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  /** Layout target the node is pulled toward. */
  tx: number;
  ty: number;
  r: number;
}

/**
 * Keeps nodes inside the frame. Collision pressure in a dense year like 2026
 * will happily shove bubbles off-canvas otherwise, and a lab you can't see is
 * a lab that isn't on the map.
 */
function forceBounds(nodes: SimNode[]) {
  return () => {
    for (const n of nodes) {
      const pad = n.r + 4;
      n.x = Math.max(pad, Math.min(VIEW_W - pad, n.x));
      n.y = Math.max(pad, Math.min(VIEW_H - pad, n.y));
    }
  };
}

/**
 * One long-lived force simulation shared by every view.
 *
 * Switching views doesn't tear down and rebuild — it just moves each node's
 * target and re-heats the simulation, so the canvas *rearranges* rather than
 * cutting. That continuity is what makes the four layouts feel like four views
 * of one thing instead of four charts.
 */
export function useSimulation(labs: Lab[], layout: LayoutResult) {
  const nodesRef = useRef(new Map<string, SimNode>());
  const simRef = useRef<Simulation<SimNode, undefined> | null>(null);
  const [, forceRender] = useState(0);
  const activeRef = useRef<SimNode[]>([]);

  if (!simRef.current) {
    simRef.current = forceSimulation<SimNode>([])
      .alphaDecay(0.035)
      .velocityDecay(0.42)
      .stop();
  }

  useEffect(() => {
    const sim = simRef.current!;
    const store = nodesRef.current;
    const active: SimNode[] = [];

    for (const lab of labs) {
      const target = layout.targets.get(lab.slug);
      if (!target) continue;
      let node = store.get(lab.slug);
      if (!node) {
        // Enter from near the target with a little scatter, so new nodes don't
        // all stack on the exact same pixel and explode apart on first tick.
        node = {
          slug: lab.slug,
          lab,
          x: target.x + (Math.random() - 0.5) * 60,
          y: target.y + (Math.random() - 0.5) * 60,
          tx: target.x,
          ty: target.y,
          r: radiusFor(lab.valuation.usdM, layout.radiusScale),
        };
        store.set(lab.slug, node);
      }
      node.lab = lab;
      node.tx = target.x;
      node.ty = target.y;
      node.r = radiusFor(lab.valuation.usdM, layout.radiusScale);
      active.push(node);
    }

    activeRef.current = active;

    sim.nodes(active);
    sim.force('x', forceX<SimNode>((d) => d.tx).strength(0.16));
    sim.force('y', forceY<SimNode>((d) => d.ty).strength(0.16));
    sim.force(
      'collide',
      forceCollide<SimNode>((d) => d.r + 2)
        .strength(layout.collideStrength)
        .iterations(2)
    );
    // Registered last so it runs after the other forces have moved everything.
    sim.force('bounds', layout.bounded ? forceBounds(active) : null);
    sim.on('tick', () => forceRender((n) => n + 1));
    sim.alpha(0.85).restart();

    return () => {
      sim.on('tick', null);
    };
  }, [labs, layout]);

  useEffect(
    () => () => {
      simRef.current?.stop();
    },
    []
  );

  const reheat = (alpha = 0.3) => simRef.current?.alphaTarget(alpha).restart();
  const cool = () => simRef.current?.alphaTarget(0);

  return { nodes: activeRef.current, reheat, cool };
}
