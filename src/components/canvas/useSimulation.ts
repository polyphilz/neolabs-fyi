import { useEffect, useRef, useState } from 'react';
import { forceCollide, forceSimulation, forceX, forceY, type Simulation } from 'd3-force';

import type { Lab } from '../../data/types';
import { VIEW_H, VIEW_W, radiusFor, type Box, type LayoutResult } from '../../lib/layout';

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
 * Keeps nodes inside the frame, and — where the layout supplies per-node boxes
 * — inside their own cell. Collision pressure will otherwise shove bubbles
 * off-canvas, or out of one cluster and across a neighbour's heading.
 */
function forceBounds(nodes: SimNode[], boxes?: Map<string, Box>) {
  return () => {
    for (const n of nodes) {
      const pad = n.r + 4;
      const box = boxes?.get(n.slug);
      // A box narrower than the node itself would fight the collision force,
      // so fall back to centring in that axis rather than clamping to nothing.
      if (box) {
        const x0 = box.x0 + pad;
        const x1 = box.x1 - pad;
        const y0 = box.y0 + pad;
        const y1 = box.y1 - pad;
        n.x = x0 <= x1 ? Math.max(x0, Math.min(x1, n.x)) : (box.x0 + box.x1) / 2;
        n.y = y0 <= y1 ? Math.max(y0, Math.min(y1, n.y)) : (box.y0 + box.y1) / 2;
        continue;
      }
      n.x = Math.max(pad, Math.min(VIEW_W - pad, n.x));
      n.y = Math.max(pad, Math.min(VIEW_H - pad, n.y));
    }
  };
}

/**
 * Collision may negotiate a small offset, but it must not erase a data axis.
 * This runs after collision and keeps each mark close enough to its target that
 * a year ring or map coordinate still means what it says.
 */
function forceTargetTether(nodes: SimNode[], maxDisplacement: number) {
  return () => {
    for (const node of nodes) {
      const dx = node.x - node.tx;
      const dy = node.y - node.ty;
      const distance = Math.hypot(dx, dy);
      if (distance <= maxDisplacement || distance === 0) continue;
      node.x = node.tx + (dx / distance) * maxDisplacement;
      node.y = node.ty + (dy / distance) * maxDisplacement;
      node.vx = (node.vx ?? 0) * 0.35;
      node.vy = (node.vy ?? 0) * 0.35;
    }
  };
}

/** Keep the complete circle, rather than only its centre, inside an ellipse. */
function forceRadialBounds(
  nodes: SimNode[],
  bounds: NonNullable<LayoutResult['radialBounds']>
) {
  return () => {
    for (const node of nodes) {
      let ux = (node.x - bounds.cx) / bounds.xScale;
      let uy = node.y - bounds.cy;
      let distance = Math.hypot(ux, uy);
      const targetUx = (node.tx - bounds.cx) / bounds.xScale;
      const targetUy = node.ty - bounds.cy;
      const targetDistance = Math.hypot(targetUx, targetUy) || 1;
      if (distance === 0) distance = targetDistance;

      // Using the circle radius in normalized ellipse space is conservative on
      // the wide axis and exact on the short one, so no visible edge leaks.
      const minimum = bounds.innerRadius + node.r + bounds.padding;
      const maximum = bounds.outerRadius - node.r - bounds.padding;
      const clamped = Math.max(minimum, Math.min(maximum, distance));
      if (clamped === distance) continue;

      // Clamp along the lab's target spoke. Preserving its transient collision
      // angle here could keep it outside the core by throwing it into a
      // neighboring research petal.
      node.x = bounds.cx + (targetUx / targetDistance) * clamped * bounds.xScale;
      node.y = bounds.cy + (targetUy / targetDistance) * clamped;
      node.vx = (node.vx ?? 0) * 0.35;
      node.vy = (node.vy ?? 0) * 0.35;
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
    const targetStrength = layout.targetStrength ?? 0.16;
    sim.force('x', forceX<SimNode>((d) => d.tx).strength(targetStrength));
    sim.force('y', forceY<SimNode>((d) => d.ty).strength(targetStrength));
    sim.force(
      'collide',
      forceCollide<SimNode>((d) => d.r + 2)
        .strength(layout.collideStrength)
        .iterations(2)
    );
    sim.force(
      'target-tether',
      layout.maxTargetDisplacement
        ? forceTargetTether(active, layout.maxTargetDisplacement)
        : null
    );
    sim.force(
      'radial-bounds',
      layout.radialBounds ? forceRadialBounds(active, layout.radialBounds) : null
    );
    // Registered last so it runs after the other forces have moved everything.
    sim.force('bounds', layout.bounded ? forceBounds(active, layout.nodeBounds) : null);
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
