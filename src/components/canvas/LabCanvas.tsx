import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { LINEAGE_ORDER } from '../../data/taxonomy';
import type { DomainId, Lab, LineageGroup } from '../../data/types';
import type { Basemap } from '../../lib/basemap';
import { UNKNOWN_FILL, UNKNOWN_INK, fillFor, valuationStep } from '../../lib/color';
import { hexJitter, hexPath } from '../../lib/hex';
import {
  VIEW_H,
  VIEW_W,
  computeLayout,
  lineageGroupsOf,
  type CategoricalSizeScale,
  type CanvasViewId,
} from '../../lib/layout';
import {
  canvasNames,
  labValuationLabel,
  spaceLabel,
  type CanvasLabel,
  type CanvasMark,
} from '../../lib/format';
import {
  LINE_SPACING,
  fitLabel,
  fitMark,
  refreshLabelMetrics,
  type FittedLabel,
  type FittedMark,
} from '../../lib/labelFit';
import { AREA_COLORS, BloomCore, ResearchBloom } from './ResearchBloom';
import { LineageEdges } from './LineageEdges';
import { LineageRail, LineageYearAxis } from './LineageRail';
import { useSimulation, type SimNode } from './useSimulation';
import { useViewport } from './useViewport';
import { ValuationBands } from './ValuationBands';

interface Props {
  labs: Lab[];
  allLabs: Lab[];
  basemap: Basemap;
  view: CanvasViewId;
  sizeScale: CategoricalSizeScale;
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

/**
 * Smallest on-screen type we'll draw on a bubble. The threshold is in *screen*
 * pixels, not canvas units, which is what lets labels fade in as you zoom into
 * a small bubble rather than being permanently hidden.
 */
const MIN_SCREEN_FONT = 9.5;

/**
 * The same floor for marks, which is lower on purpose. Type has to be read
 * glyph by glyph, so below ~9px it stops resolving into words; a mark is
 * recognised whole, as a silhouette, and survives being smaller. Holding both
 * to the type threshold hid a lab's logo on any hex too small for its name —
 * which is most of them at the zoom the page opens at.
 */
const MIN_SCREEN_MARK = 6.5;

/**
 * Drag slop: how far the pointer must travel before a press counts as a drag
 * rather than a click. Without this, a single pixel of hand tremor between
 * press and release swallowed the click entirely — and essentially no real
 * click is 0px, least of all on a trackpad.
 *
 * Touch needs more room than a mouse because fingers roll as they lift.
 */
const SLOP_MOUSE = 4;
const SLOP_TOUCH = 10;
const TOUCH_LONG_PRESS_MS = 450;
const slopFor = (pointerType: string) => (pointerType === 'mouse' ? SLOP_MOUSE : SLOP_TOUCH);

/** Minimum on-screen hit radius, so the smallest bubbles are still clickable. */
const MIN_HIT_SCREEN = 12;

/**
 * Labels are always drawn at this font-size in user units and scaled to fit by
 * the group around them. Setting a sub-pixel font-size directly makes the
 * rasteriser paint glyphs wider than their reported metrics, so the text spills
 * out of small bubbles even though it measures as fitting.
 */
const NOMINAL_FONT = 12;

/**
 * How much better than the bare legibility floor a name has to be before it
 * takes over from the one already on screen. Without it, a bubble sitting on
 * the exact zoom where the longer name starts to fit would flip between the two
 * on a pixel of scroll. With it, promoting needs 12% of headroom while demoting
 * only happens once the current name is genuinely too small — a deadband, not a
 * moved threshold.
 */
const PROMOTE = 1.12;

/**
 * Selected outlines live in screen space so zoom cannot turn a small hex's
 * border into a heavy ring. Within these legibility bounds, larger rendered
 * hexes still earn a proportionally stronger outline.
 */
const SELECTION_STROKE_MIN_PX = 1.5;
const SELECTION_STROKE_MAX_PX = 4;
const SELECTION_STROKE_RADIUS_RATIO = 0.08;

function selectionStrokeWidth(radius: number, screenScale: number): number {
  return Math.min(
    SELECTION_STROKE_MAX_PX,
    Math.max(SELECTION_STROKE_MIN_PX, radius * screenScale * SELECTION_STROKE_RADIUS_RATIO)
  );
}

/** Tiny stable visual drift used only for the non-physical entrance animation. */
function bubbleEntryDrift(slug: string): { x: number; y: number } {
  let hash = 0x811c9dc5;
  for (let index = 0; index < slug.length; index++) {
    hash ^= slug.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return {
    x: ((hash & 0xff) / 0xff - 0.5) * 8,
    y: (((hash >>> 8) & 0xff) / 0xff - 0.5) * 8,
  };
}

const EMPTY_LINEAGE_OVERLAP = new Map<LineageGroup, number>();

/**
 * Lineage membership never changes during a hover, so encode it once on each
 * bubble and let one attribute on the SVG select the active set. This replaces
 * a React class mutation on every bubble with a single root mutation.
 */
const LINEAGE_FOCUS_CSS = LINEAGE_ORDER.map(
  (group) => `
.canvas-svg[data-active-lineage="${group}"] .bubble:not([data-lineages~="${group}"]) { opacity: 0.2; }
.canvas-svg[data-active-lineage="${group}"] .bubble[data-lineages~="${group}"]:not(.is-active):not(.is-selected) .bubble-disc { stroke: var(--accent); stroke-width: 1.6; }
.canvas-svg[data-active-lineage="${group}"] .rail-row[data-lineage-row="${group}"] { opacity: 1; }
.canvas-svg[data-active-lineage="${group}"] .rail-row[data-lineage-row="${group}"] .rail-bar { fill: var(--accent); opacity: 1; }
.canvas-svg[data-active-lineage="${group}"] .rail-row[data-lineage-row="${group}"] .rail-label { fill: var(--ink); font-weight: 600; }
`
).join('');

/** What chooseLabel settled on: a fitted line of type, or a fitted mark. */
type ChosenLabel =
  | { kind: 'text'; fitted: FittedLabel }
  | { kind: 'mark'; mark: CanvasMark; fitted: FittedMark };

/**
 * Longest rung that's legible at this zoom, out of the ladder in canvasNames().
 * `memory` holds which rung each lab is on, which is what makes the hysteresis
 * above possible; it's keyed by slug and self-correcting, so it survives view
 * changes without needing to be cleared.
 *
 * A mark is measured by its drawn height where type is measured by its font
 * size. They answer to different floors: see MIN_SCREEN_MARK for why a logo
 * stays legible below the size where type gives up.
 */
function chooseLabel(
  slug: string,
  rungs: CanvasLabel[],
  r: number,
  rot: number,
  screenScale: number,
  memory: Map<string, number>
): ChosenLabel | null {
  const current = memory.get(slug);
  for (let i = 0; i < rungs.length; i++) {
    const rung = rungs[i];
    const chosen: ChosenLabel | null =
      typeof rung === 'string'
        ? (() => {
            const fitted = fitLabel(rung, r, rot);
            return fitted ? { kind: 'text' as const, fitted } : null;
          })()
        : (() => {
            const fitted = fitMark(
              rung.width,
              rung.height,
              r,
              rot,
              rung.inset,
              rung.maxHeight
            );
            return fitted ? { kind: 'mark' as const, mark: rung, fitted } : null;
          })();
    if (!chosen) continue;

    const isMark = chosen.kind === 'mark';
    const size = isMark ? chosen.fitted.height : chosen.fitted.fontSize;
    // The margin governs switching, not first paint: on a fresh render there's
    // nothing on screen to flicker against, and charging it would demote a name
    // that was reading perfectly well before the ladder existed.
    const settled = current === undefined || i === current;
    const base = isMark ? MIN_SCREEN_MARK : MIN_SCREEN_FONT;
    const floor = settled ? base : base * PROMOTE;
    if (size * screenScale >= floor) {
      memory.set(slug, i);
      return chosen;
    }
  }
  // Nothing fits: forget the rung, so the lab starts clean when it next has room.
  memory.delete(slug);
  return null;
}

export function LabCanvas({ labs, allLabs, basemap, view, sizeScale, selected, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredLineage, setHoveredLineage] = useState<LineageGroup | null>(null);
  const [pinnedLineage, setPinnedLineage] = useState<LineageGroup | null>(null);
  const [hoveredArea, setHoveredArea] = useState<DomainId | null>(null);
  const [pinnedArea, setPinnedArea] = useState<DomainId | null>(null);
  const [touchFocused, setTouchFocused] = useState<string | null>(null);
  const [repositioning, setRepositioning] = useState<string | null>(null);
  const dragRef = useRef<{
    node: SimNode;
    pointerId: number;
    startX: number;
    startY: number;
    pointerType: string;
    mode: 'pending' | 'pan' | 'node';
    longPressTimer: number | null;
  } | null>(null);
  /** Same press-vs-drag question for the canvas background. */
  const panRef = useRef<{
    startX: number;
    startY: number;
    pointerType: string;
    moved: boolean;
    areaId: DomainId | null;
  } | null>(null);
  const lastPointerDownRef = useRef<{ type: string; at: number }>({ type: 'mouse', at: 0 });

  const layout = useMemo(
    () => computeLayout(view, labs, basemap, allLabs, sizeScale),
    [view, labs, basemap, allLabs, sizeScale]
  );

  useEffect(() => {
    if (view !== 'area') setPinnedArea(null);
    if (view !== 'lineage') setPinnedLineage(null);
    setTouchFocused(null);
  }, [view]);

  useEffect(() => {
    setTouchFocused((current) =>
      current && !labs.some((lab) => lab.slug === current) ? null : current
    );
  }, [labs]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinnedArea(null);
        setPinnedLineage(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { nodes, frame, reheat, cool } = useSimulation(labs, layout);
  const {
    transform,
    toCanvas,
    fit,
    startPan,
    movePan,
    endPan,
    cancelPan,
    activePointerCount,
  } = useViewport(svgRef, VIEW_W, VIEW_H);

  // A filter can remove a lab while a second finger is operating the header.
  // Release any gesture that still owns that now-hidden node instead of
  // leaving its timer, fixed coordinates, or repositioning treatment behind.
  useEffect(() => {
    const gesture = dragRef.current;
    if (!gesture || labs.some((lab) => lab.slug === gesture.node.slug)) return;
    if (gesture.longPressTimer !== null) window.clearTimeout(gesture.longPressTimer);
    gesture.node.fx = null;
    gesture.node.fy = null;
    dragRef.current = null;
    cancelPan(gesture.pointerId);
    setRepositioning(null);
    cool();
  }, [labs, cancelPan, cool]);

  useEffect(
    () => () => {
      const gesture = dragRef.current;
      if (gesture?.longPressTimer !== null && gesture?.longPressTimer !== undefined) {
        window.clearTimeout(gesture.longPressTimer);
      }
      if (gesture?.mode === 'node') {
        gesture.node.fx = null;
        gesture.node.fy = null;
      }
    },
    []
  );

  // How many screen pixels one canvas unit occupies at zoom 1. Needed to decide
  // legibility, and it changes with the viewport, so watch for resizes rather
  // than measuring on every frame.
  const [fitScale, setFitScale] = useState(1);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width && height) setFitScale(Math.min(width / VIEW_W, height / VIEW_H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  /** Canvas units -> screen pixels, including zoom. */
  const screenScale = transform.k * fitScale;

  /**
   * Paint order: largest first, so small bubbles land on top and their hit
   * targets win. Previously this was data order, and small nodes stayed
   * clickable only by luck.
   */
  const drawOrder = useMemo(() => [...nodes].sort((a, b) => b.r - a.r), [nodes]);

  const positions = useMemo(() => {
    const map = new Map<string, SimNode>();
    for (const n of nodes) map.set(n.slug, n);
    return map;
  }, [nodes]);

  const onNodePointerDown = useCallback(
    (e: React.PointerEvent, node: SimNode) => {
      e.stopPropagation();
      lastPointerDownRef.current = { type: e.pointerType, at: performance.now() };
      if (e.pointerType === 'touch') setHovered(null);

      const previous = dragRef.current;
      if (previous?.longPressTimer !== null && previous?.longPressTimer !== undefined) {
        window.clearTimeout(previous.longPressTimer);
        previous.longPressTimer = null;
      }

      // A second touch always means viewport navigation, never a second node
      // gesture. useViewport will turn the two active pointers into a pinch.
      if (e.pointerType === 'touch' && previous && previous.pointerId !== e.pointerId) {
        // Once a long press owns the first finger, ignore additional touches
        // until that deliberate reposition gesture ends.
        if (previous.mode === 'node') return;
        previous.mode = 'pan';
        previous.node.fx = null;
        previous.node.fy = null;
        setRepositioning(null);
        startPan(e);
        return;
      }

      const gesture: NonNullable<typeof dragRef.current> = {
        node,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        pointerType: e.pointerType,
        mode: 'pending',
        longPressTimer: null,
      };
      dragRef.current = gesture;

      if (e.pointerType === 'touch') {
        // Touch begins as a viewport gesture. Only an unmoving long press can
        // promote it to direct node manipulation.
        startPan(e);
        if (activePointerCount() > 1) {
          gesture.mode = 'pan';
          return;
        }
        gesture.longPressTimer = window.setTimeout(() => {
          const current = dragRef.current;
          if (current !== gesture || current.mode !== 'pending') return;
          current.longPressTimer = null;
          current.mode = 'node';
          cancelPan(current.pointerId);
          current.node.fx = current.node.x;
          current.node.fy = current.node.y;
          setRepositioning(current.node.slug);
          reheat(0.25);
        }, TOUCH_LONG_PRESS_MS);
        return;
      }

      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    },
    [activePointerCount, cancelPan, reheat, startPan]
  );

  const onNodePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) {
        if (e.pointerType === 'touch') movePan(e);
        return;
      }

      if (drag.mode === 'pending') {
        const travelled = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
        if (travelled < slopFor(drag.pointerType)) return;
        if (drag.longPressTimer !== null) {
          window.clearTimeout(drag.longPressTimer);
          drag.longPressTimer = null;
        }
        if (drag.pointerType === 'touch') {
          drag.mode = 'pan';
          // Rebase at the slop boundary so the viewport does not visibly jump
          // by the entire threshold when a potential tap becomes a pan.
          startPan(e);
          return;
        }
        drag.mode = 'node';
        reheat(0.35);
      }

      if (drag.mode === 'pan') {
        movePan(e);
        return;
      }

      const p = toCanvas(e.clientX, e.clientY);
      drag.node.fx = p.x;
      drag.node.fy = p.y;
    },
    [movePan, reheat, startPan, toCanvas]
  );

  const finishNodePointer = useCallback(
    (e: React.PointerEvent, node: SimNode, cancelled: boolean) => {
      e.stopPropagation();
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) {
        if (e.pointerType === 'touch') endPan(e);
        return;
      }
      dragRef.current = null;
      if (drag.longPressTimer !== null) window.clearTimeout(drag.longPressTimer);
      if (drag.pointerType === 'touch') endPan(e);

      if (drag.mode === 'node') {
        drag.node.fx = null;
        drag.node.fy = null;
        setRepositioning(null);
        cool();
        return;
      }

      if (!cancelled && drag.mode === 'pending') {
        if (drag.pointerType === 'touch') {
          if (touchFocused === node.slug) {
            onSelect(node.slug);
          } else {
            setTouchFocused(node.slug);
          }
        } else {
          setTouchFocused(null);
          onSelect(node.slug === selected ? null : node.slug);
        }
      }
    },
    [cool, endPan, onSelect, selected, touchFocused]
  );

  const onNodePointerUp = useCallback(
    (e: React.PointerEvent, node: SimNode) => finishNodePointer(e, node, false),
    [finishNodePointer]
  );

  const onNodePointerCancel = useCallback(
    (e: React.PointerEvent, node: SimNode) => finishNodePointer(e, node, true),
    [finishNodePointer]
  );

  const onDirectSelect = useCallback(
    (slug: string | null) => {
      setTouchFocused(null);
      onSelect(slug);
    },
    [onSelect]
  );

  const onBackgroundDown = useCallback(
    (e: React.PointerEvent) => {
      lastPointerDownRef.current = { type: e.pointerType, at: performance.now() };
      const nodeGesture = dragRef.current;
      if (e.pointerType === 'touch' && nodeGesture?.pointerType === 'touch') {
        if (nodeGesture.mode === 'node') return;
        if (nodeGesture.longPressTimer !== null) {
          window.clearTimeout(nodeGesture.longPressTimer);
          nodeGesture.longPressTimer = null;
        }
        nodeGesture.mode = 'pan';
        nodeGesture.node.fx = null;
        nodeGesture.node.fy = null;
        setRepositioning(null);
      }
      const rawAreaId =
        e.target instanceof Element
          ? e.target.closest<SVGGElement>('[data-area-id]')?.dataset.areaId
          : undefined;
      const pan = {
        startX: e.clientX,
        startY: e.clientY,
        pointerType: e.pointerType,
        moved: false,
        areaId:
          view === 'area' && rawAreaId && rawAreaId in AREA_COLORS
            ? (rawAreaId as DomainId)
            : null,
      };
      panRef.current = pan;
      startPan(e);
      if (activePointerCount() > 1) pan.moved = true;
    },
    [activePointerCount, startPan, view]
  );

  const onBackgroundMove = useCallback(
    (e: React.PointerEvent) => {
      const pan = panRef.current;
      if (pan && !pan.moved) {
        const travelled = Math.hypot(e.clientX - pan.startX, e.clientY - pan.startY);
        if (travelled >= slopFor(pan.pointerType)) pan.moved = true;
      }
      movePan(e);
    },
    [movePan]
  );

  const onBackgroundUp = useCallback(
    (e: React.PointerEvent) => {
      const pan = panRef.current;
      panRef.current = null;
      endPan(e);
      // Only a genuine tap on empty canvas dismisses the panel. Panning used to
      // count as a click on the background and closed whatever you were reading.
      if (pan && !pan.moved) {
        onSelect(null);
        setTouchFocused(null);
        setPinnedLineage(null);
        if (pan.areaId) {
          setPinnedArea((current) => (current === pan.areaId ? null : pan.areaId));
        } else {
          setPinnedArea(null);
        }
      }
    },
    [endPan, onSelect]
  );

  /** Hit radius in canvas units that yields MIN_HIT_SCREEN pixels on screen. */
  const hitRadius = MIN_HIT_SCREEN / Math.max(screenScale, 0.0001);

  const dec = layout.decorations;
  const active = hovered ?? selected ?? touchFocused;
  const activeNode = active ? positions.get(active) : null;
  const hoveredNode = hovered ? positions.get(hovered) : null;
  const activeArea =
    view === 'area' ? (hoveredArea ?? activeNode?.lab.domain ?? pinnedArea) : null;
  // Hover beats pin while it lasts, the same contract the research bloom uses:
  // a pin is a frame you keep, not a lock on what you can look at next.
  const activeLineage = view === 'lineage' ? (hoveredLineage ?? pinnedLineage) : null;

  const groupsBySlug = useMemo(() => {
    const map = new Map<string, LineageGroup[]>();
    for (const lab of labs) map.set(lab.slug, lineageGroupsOf(lab));
    return map;
  }, [labs]);

  /**
   * Every pairwise overlap is static for the filtered dataset. Compute the
   * complete matrix once instead of rescanning every lab on pointer movement.
   */
  const lineageOverlaps = useMemo(() => {
    const matrix = new Map<LineageGroup, Map<LineageGroup, number>>();
    for (const groups of groupsBySlug.values()) {
      for (const activeGroup of groups) {
        let overlaps = matrix.get(activeGroup);
        if (!overlaps) {
          overlaps = new Map();
          matrix.set(activeGroup, overlaps);
        }
        for (const otherGroup of groups) {
          if (otherGroup !== activeGroup) {
            overlaps.set(otherGroup, (overlaps.get(otherGroup) ?? 0) + 1);
          }
        }
      }
    }
    return matrix;
  }, [groupsBySlug]);

  const lineageOverlap = activeLineage
    ? (lineageOverlaps.get(activeLineage) ?? EMPTY_LINEAGE_OVERLAP)
    : EMPTY_LINEAGE_OVERLAP;

  const onToggleLineage = useCallback(
    (group: LineageGroup) =>
      setPinnedLineage((current) => (current === group ? null : group)),
    []
  );

  const onCanvasContextMenu = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    const nativePointerType =
      'pointerType' in event.nativeEvent
        ? (event.nativeEvent as PointerEvent).pointerType
        : undefined;
    const activeGestureIsTouch =
      dragRef.current?.pointerType === 'touch' || panRef.current?.pointerType === 'touch';
    const lastPointerDown = lastPointerDownRef.current;
    const followsTouch =
      lastPointerDown.type === 'touch' && performance.now() - lastPointerDown.at < 1500;
    if (nativePointerType === 'touch' || activeGestureIsTouch || followsTouch) {
      event.preventDefault();
    }
  }, []);

  return (
    <div className="canvas-shell">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="canvas-svg"
        data-view={view}
        data-active-lineage={activeLineage ?? undefined}
        role="application"
        aria-label={`Neolab map, ${view} view. ${labs.length} labs shown. The same labs are available as a sortable table from the Table view.`}
        onPointerDown={onBackgroundDown}
        onPointerMove={onBackgroundMove}
        onPointerUp={onBackgroundUp}
        onPointerCancel={onBackgroundUp}
        onContextMenu={onCanvasContextMenu}
      >
        {/* Hit surface so gestures over empty canvas still reach the SVG.
            Dismissal is handled by the pointer handlers above, which can tell
            a tap from a pan; a bare onClick here could not. */}
        <rect
          x={-VIEW_W * 4}
          y={-VIEW_H * 4}
          width={VIEW_W * 9}
          height={VIEW_H * 9}
          fill="transparent"
        />

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {dec.basemap && (
            <g transform={dec.basemap.transform} className="basemap" aria-hidden="true">
              <path d={dec.basemap.graticule} className="basemap-graticule" />
              <path d={dec.basemap.land} className="basemap-land" />
            </g>
          )}

          {dec.valuationBands && <ValuationBands axis={dec.valuationBands} />}

          {dec.areaAtlas && (
            <ResearchBloom
              atlas={dec.areaAtlas}
              activeArea={activeArea}
              pinnedArea={pinnedArea}
              onHover={setHoveredArea}
              onToggle={(domain) => setPinnedArea((current) => (current === domain ? null : domain))}
            />
          )}

          {dec.yearAxis && <LineageYearAxis axis={dec.yearAxis} />}

          {dec.edges && dec.lineageRail && (
            <LineageEdges
              edges={dec.edges}
              rail={dec.lineageRail}
              positions={positions}
              groupsBySlug={groupsBySlug}
              activeLab={active}
              activeGroup={activeLineage}
              frame={frame}
            />
          )}

          <BubbleLayer
            drawOrder={drawOrder}
            frame={frame}
            selected={selected}
            touchFocused={touchFocused}
            repositioning={repositioning}
            active={active}
            activeArea={activeArea}
            groupsBySlug={groupsBySlug}
            screenScale={screenScale}
            hitRadius={hitRadius}
            onNodePointerDown={onNodePointerDown}
            onNodePointerMove={onNodePointerMove}
            onNodePointerUp={onNodePointerUp}
            onNodePointerCancel={onNodePointerCancel}
            onHover={setHovered}
            onSelect={onDirectSelect}
          />

          {dec.areaAtlas && (
            <BloomCore
              atlas={dec.areaAtlas}
              activeSector={
                activeArea
                  ? dec.areaAtlas.sectors.find((sector) => sector.id === activeArea) ?? null
                  : null
              }
            />
          )}

          {/* Drawn after the bubbles: the rail is the anchor of the whole view,
              and a lab drifting over it would cover the ranking. Nothing in the
              field reaches x=248, but zoom and drag both can. */}
          {dec.lineageRail && (
            <LineageRail
              rail={dec.lineageRail}
              activeGroup={activeLineage}
              pinnedGroup={pinnedLineage}
              overlap={lineageOverlap}
              onHover={setHoveredLineage}
              onToggle={onToggleLineage}
            />
          )}
        </g>

        <defs>
          <style>{LINEAGE_FOCUS_CSS}</style>
        </defs>
      </svg>

      {/* Selection has its own full detail card. Keeping the hover summary on
          screen at the same time only duplicates and obscures that content. */}
      {!selected && hoveredNode && (
        <Tooltip node={hoveredNode} transform={transform} fit={fit} />
      )}

      {!selected && (
        <div className="mobile-gesture-legend" role="note">
          {touchFocused ? (
            <>
              <span>Tap again for profile</span>
              <i aria-hidden="true" />
              <span>Tap outside to clear</span>
            </>
          ) : (
            <>
              <span>Drag to pan</span>
              <i aria-hidden="true" />
              <span>Tap to select</span>
              <i aria-hidden="true" />
              <span>Hold to move</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface BubbleLayerProps {
  drawOrder: SimNode[];
  /** Mutable simulation nodes need an explicit revision to cross memo(). */
  frame: number;
  selected: string | null;
  touchFocused: string | null;
  repositioning: string | null;
  active: string | null;
  activeArea: DomainId | null;
  groupsBySlug: Map<string, LineageGroup[]>;
  screenScale: number;
  hitRadius: number;
  onNodePointerDown: (event: React.PointerEvent, node: SimNode) => void;
  onNodePointerMove: (event: React.PointerEvent) => void;
  onNodePointerUp: (event: React.PointerEvent, node: SimNode) => void;
  onNodePointerCancel: (event: React.PointerEvent, node: SimNode) => void;
  onHover: React.Dispatch<React.SetStateAction<string | null>>;
  onSelect: (slug: string | null) => void;
}

/**
 * A memo boundary around the expensive label-fitting layer. Lineage focus is
 * intentionally absent from these props: one root data attribute handles that
 * visual state, so moving across the origin rail never revisits every label.
 */
const BubbleLayer = memo(function BubbleLayer({
  drawOrder,
  frame,
  selected,
  touchFocused,
  repositioning,
  active,
  activeArea,
  groupsBySlug,
  screenScale,
  hitRadius,
  onNodePointerDown,
  onNodePointerMove,
  onNodePointerUp,
  onNodePointerCancel,
  onHover,
  onSelect,
}: BubbleLayerProps) {
  /** Which rung of the name ladder each lab is currently showing. */
  const labelRung = useRef(new Map<string, number>());
  const [, remeasure] = useState(0);
  // The value itself is not rendered; changing it tells memo() that mutable
  // simulation coordinates have advanced and the transforms must be refreshed.
  void frame;

  // Label fitting measures real text, but only after mount — measuring during
  // SSR would desync server and client HTML. Re-measure once webfonts land.
  useEffect(() => {
    const apply = () => {
      refreshLabelMetrics();
      labelRung.current.clear();
      remeasure((n) => n + 1);
    };
    apply();
    document.fonts?.ready.then(apply).catch(() => {});
  }, []);

  return (
    <g className="bubbles">
      {drawOrder.map((n) => {
        const isActive = active === n.slug;
        const isSelected = selected === n.slug || touchFocused === n.slug;
        const isRepositioning = repositioning === n.slug;
        const areaMuted = Boolean(activeArea && n.lab.domain !== activeArea);
        const areaHighlighted = activeArea === n.lab.domain;
        const unknown =
          n.lab.valuation.qualifier === 'undisclosed' ||
          n.lab.structure === 'subsidiary' ||
          n.lab.structure === 'nonprofit';
        const step = valuationStep(n.lab.valuation.usdM);
        // Rotation and scale are per-lab and stable; the label has to be fitted
        // to the hexagon as actually drawn, not the packing circle.
        const jitter = hexJitter(n.slug);
        const entryDrift = bubbleEntryDrift(n.slug);
        const shapeR = n.r * jitter.scale;
        const selectionStroke = selectionStrokeWidth(shapeR, screenScale);
        const label = chooseLabel(
          n.slug,
          canvasNames(n.lab),
          shapeR,
          jitter.rot,
          screenScale,
          labelRung.current
        );

        return (
          <g
            key={n.slug}
            transform={`translate(${n.x},${n.y})`}
            className={`bubble${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}${isRepositioning ? ' is-repositioning' : ''}${areaMuted ? ' is-area-muted' : ''}${areaHighlighted ? ' is-area-highlighted' : ''}`}
            data-lineages={groupsBySlug.get(n.slug)?.join(' ')}
            style={
              {
                '--area-color': AREA_COLORS[n.lab.domain],
                '--selection-stroke': selectionStroke,
                '--bubble-entry-x': `${entryDrift.x}px`,
                '--bubble-entry-y': `${entryDrift.y}px`,
              } as React.CSSProperties
            }
            onPointerDown={(event) => onNodePointerDown(event, n)}
            onPointerMove={onNodePointerMove}
            onPointerUp={(event) => onNodePointerUp(event, n)}
            onPointerCancel={(event) => onNodePointerCancel(event, n)}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch') onHover(n.slug);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType !== 'touch') {
                onHover((hovered) => (hovered === n.slug ? null : hovered));
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${n.lab.name}, ${labValuationLabel(n.lab)}, ${spaceLabel(n.lab)}, founded ${n.lab.year}`}
            onFocus={(event) => {
              // Touch focus must not resurrect the desktop hover tooltip;
              // keyboard focus remains discoverable through :focus-visible.
              if (event.currentTarget.matches(':focus-visible')) onHover(n.slug);
            }}
            onBlur={() => onHover((hovered) => (hovered === n.slug ? null : hovered))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(n.slug === selected ? null : n.slug);
              }
            }}
          >
            <g className="bubble-entry">
              <path
                d={hexPath(shapeR, jitter.corner, jitter.rot)}
                fill={unknown ? UNKNOWN_FILL : fillFor(n.lab.valuation.usdM)}
                strokeWidth={Math.min(2, n.r * 0.12)}
                className="bubble-disc"
              />
              {/* A $335M lab is ~10px across, which is a miserable target. This
                  pads it out without changing what's drawn. */}
              {hitRadius > n.r && <circle r={hitRadius} className="bubble-hit" />}
              {label?.kind === 'text' && (
                <g transform={`scale(${label.fitted.fontSize / NOMINAL_FONT})`}>
                  <text
                    className="bubble-label"
                    textAnchor="middle"
                    style={{
                      fontSize: NOMINAL_FONT,
                      fill: unknown ? UNKNOWN_INK : `var(--on-seq-${step})`,
                    }}
                  >
                    {label.fitted.lines.map((line, index) => (
                      <tspan
                        key={line + index}
                        x={0}
                        y={
                          (index - (label.fitted.lines.length - 1) / 2) *
                            NOMINAL_FONT *
                            LINE_SPACING +
                          NOMINAL_FONT * 0.34
                        }
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              )}
              {label?.kind === 'mark' && (
                <g
                  className="bubble-mark"
                  style={{ color: unknown ? UNKNOWN_INK : `var(--on-seq-${step})` }}
                  transform={`scale(${label.fitted.scale}) translate(${-(label.mark.x + label.mark.width / 2)},${-(label.mark.y + label.mark.height / 2)})`}
                >
                  {label.mark.shapes.map((shape) => (
                    <path
                      key={shape.d}
                      d={shape.d}
                      fill={shape.strokeWidth ? 'none' : 'currentColor'}
                      fillRule={shape.fillRule}
                      stroke={shape.strokeWidth ? 'currentColor' : 'none'}
                      strokeWidth={shape.strokeWidth}
                      strokeLinecap={shape.linecap}
                      strokeLinejoin={shape.linejoin ?? shape.linecap}
                    />
                  ))}
                </g>
              )}
            </g>
          </g>
        );
      })}
    </g>
  );
});

interface TipProps {
  node: SimNode;
  transform: { k: number; x: number; y: number };
  fit: () => { rect: DOMRect; scale: number; insetX: number; insetY: number } | null;
}

/**
 * Plain HTML, positioned over the SVG rather than drawn inside it.
 *
 * The previous version was an SVG <rect> + <text> whose width and height were
 * estimated from character counts — which clipped the last line and truncated
 * long names. Letting the browser lay out real text removes the guesswork; we
 * only have to place the box and keep it inside the canvas.
 */
function Tooltip({ node, transform, fit }: TipProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Position after layout, reading the box's real size, and write straight to
  // the DOM node so there is no second render and therefore no flicker.
  useLayoutEffect(() => {
    const el = ref.current;
    const f = fit();
    if (!el || !f) return;

    const cx = f.insetX + (node.x * transform.k + transform.x) * f.scale;
    const cy = f.insetY + (node.y * transform.k + transform.y) * f.scale;
    const r = node.r * transform.k * f.scale;

    const { width, height } = el.getBoundingClientRect();
    const GAP = 12;
    const EDGE = 10;

    // Prefer below the bubble; flip above when there isn't room.
    let top = cy + r + GAP;
    if (top + height > f.rect.height - EDGE) {
      const above = cy - r - GAP - height;
      top = above >= EDGE ? above : Math.max(EDGE, f.rect.height - height - EDGE);
    }

    const left = Math.min(
      Math.max(cx - width / 2, EDGE),
      Math.max(EDGE, f.rect.width - width - EDGE)
    );

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.visibility = 'visible';
  }, [node, node.x, node.y, node.r, transform, fit]);

  const { lab } = node;

  return (
    <div ref={ref} className="tooltip" role="tooltip">
      <p className="tooltip-title">{lab.name}</p>
      <p className="tooltip-value">{labValuationLabel(lab)}</p>
      <p className="tooltip-line">{spaceLabel(lab)}</p>
      <p className="tooltip-line">
        {lab.location.city} · founded {lab.year}
      </p>
    </div>
  );
}
