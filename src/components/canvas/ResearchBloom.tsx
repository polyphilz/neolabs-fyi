import type { CSSProperties } from 'react';

import { DOMAINS } from '../../data/taxonomy';
import type { DomainId } from '../../data/types';
import type { AreaAtlas, AreaSector } from '../../lib/layout';
import { stable } from '../../lib/precision';

/*
 * Categorical, so these are eleven hues rather than a ramp — but pulled toward
 * the palette's earth-and-pond register (moss, midnight, ochre, terracotta)
 * instead of the saturated screen colours they were. Each is mixed against the
 * page at a low percentage, so they only ever appear as tints.
 */
export const AREA_COLORS: Record<DomainId, string> = {
  general: '#4b8b96',
  coding: '#8d9e4e',
  rsi: '#8a7fc0',
  physical: '#c4795f',
  world: '#c4a24f',
  media: '#a56f87',
  science: '#3c8c76',
  inference: '#c17d95',
  compute: '#7285ad',
  applied: '#cf8f52',
  safety: '#5f9268',
};

const AREA_LABEL_LINES: Record<DomainId, string[]> = {
  general: ['General-purpose', 'models'],
  coding: ['Coding'],
  rsi: ['Recursive', 'self-improvement'],
  physical: ['Physical AI', '& robotics'],
  world: ['World models', '& simulation'],
  media: ['Generative', 'media'],
  science: ['AI for math', '& science'],
  inference: ['Inference'],
  compute: ['Compute & chips'],
  applied: ['Applied & agents'],
  safety: ['Interpretability'],
};

interface ResearchBloomProps {
  atlas: AreaAtlas;
  activeArea: DomainId | null;
  pinnedArea: DomainId | null;
  onHover: (domain: DomainId | null) => void;
  onToggle: (domain: DomainId) => void;
}

/**
 * Research areas as one chronological specimen: angle separates fields and
 * distance from the centre encodes founding year. The direct labels mean the
 * colours can stay atmospheric rather than acting as an inaccessible legend.
 */
export function ResearchBloom({
  atlas,
  activeArea,
  pinnedArea,
  onHover,
  onToggle,
}: ResearchBloomProps) {
  return (
    <g className={`research-bloom${activeArea ? ' has-active-area' : ''}`}>
      <ellipse
        className="research-bloom-halo"
        cx={atlas.cx}
        cy={atlas.cy}
        rx={atlas.outerRadius * atlas.xScale + 10}
        ry={atlas.outerRadius + 10}
        aria-hidden="true"
      />

      <g className="area-sectors">
        {atlas.sectors.map((sector) => {
          const isActive = activeArea === sector.id;
          const isMuted = Boolean(activeArea && !isActive);
          const isPinned = pinnedArea === sector.id;
          const label = areaLabelPlacement(atlas, sector);
          const countLabel =
            sector.count === sector.total
              ? `${sector.total} ${sector.total === 1 ? 'lab' : 'labs'}`
              : `${sector.count}/${sector.total} shown`;

          return (
            <g
              key={sector.id}
              className={`area-sector${isActive ? ' is-active' : ''}${isMuted ? ' is-muted' : ''}${sector.count === 0 ? ' is-empty' : ''}`}
              style={{ '--area-color': AREA_COLORS[sector.id] } as CSSProperties}
              data-area-id={sector.id}
              role="button"
              tabIndex={0}
              aria-pressed={isPinned}
              aria-label={`${sector.label}, ${countLabel}. ${DOMAINS[sector.id].blurb}`}
              onPointerEnter={() => onHover(sector.id)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(sector.id)}
              onBlur={() => onHover(null)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onToggle(sector.id);
                }
              }}
            >
              <title>{`${sector.label}: ${countLabel}. ${DOMAINS[sector.id].blurb}`}</title>
              <path className="area-sector-fill" d={areaSectorPath(atlas, sector)} />
              <path className="area-sector-rim" d={areaArcPath(atlas, sector, atlas.outerRadius)} />
              <path className="area-sector-spine" d={areaSpinePath(atlas, sector)} />
              <path className="area-label-leader" d={areaLeaderPath(atlas, sector)} />
              <g transform={`translate(${label.x},${label.y})`} className="area-label">
                <text className="area-label-title" textAnchor={label.anchor}>
                  {AREA_LABEL_LINES[sector.id].map((line, lineIndex) => (
                    <tspan key={line} x={0} y={label.firstLineY + lineIndex * 11}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <text className="area-label-count" textAnchor={label.anchor} y={label.countY}>
                  {countLabel}
                </text>
              </g>
            </g>
          );
        })}
      </g>

      <g className="area-year-rings" aria-hidden="true">
        {atlas.rings.map((ring) => (
          <g key={ring.year} className={ring.major ? 'area-year-ring is-major' : 'area-year-ring'}>
            <ellipse
              cx={atlas.cx}
              cy={atlas.cy}
              rx={ring.radius * atlas.xScale}
              ry={ring.radius}
            />
            {ring.major && <YearRingLabel atlas={atlas} year={ring.year} radius={ring.radius} />}
          </g>
        ))}
      </g>
    </g>
  );
}

export function BloomCore({
  atlas,
  activeSector,
}: {
  atlas: AreaAtlas;
  activeSector: AreaSector | null;
}) {
  const color = activeSector ? AREA_COLORS[activeSector.id] : AREA_COLORS.general;
  const titleLines = activeSector ? AREA_LABEL_LINES[activeSector.id] : [];
  const blurbLines = activeSector ? balancedBlurbLines(DOMAINS[activeSector.id].blurb) : [];
  const titleFirstY = titleLines.length > 1 ? -30 : -23;
  const blurbFirstY = titleFirstY + titleLines.length * 14 - 1;
  const count = activeSector
    ? activeSector.count === activeSector.total
      ? `${activeSector.total} ${activeSector.total === 1 ? 'LAB' : 'LABS'}`
      : `${activeSector.count} OF ${activeSector.total} SHOWN`
    : '';

  return (
    <g
      className={`research-bloom-core${activeSector ? ' is-active' : ''}`}
      transform={`translate(${atlas.cx},${atlas.cy})`}
      style={{ '--area-color': color } as CSSProperties}
      aria-hidden="true"
    >
      <ellipse rx={atlas.innerRadius * atlas.xScale * 0.9} ry={atlas.innerRadius * 0.9} />
      {!activeSector && (
        <g className="bloom-core-legend">
          <g className="bloom-core-legend-rings" transform="translate(0,-18)">
            <ellipse rx={14} ry={6} />
            <ellipse rx={23} ry={10} />
            <ellipse className="is-outer" rx={32} ry={14} />
          </g>
          <text className="bloom-core-legend-copy" textAnchor="middle" y={13}>
            EACH RING MARKS ONE YEAR
          </text>
          <text className="bloom-core-legend-direction" textAnchor="middle" y={24}>
            OLDER INWARD · NEWER OUTWARD
          </text>
        </g>
      )}
      {activeSector && (
        <>
          <text className="bloom-core-title" textAnchor="middle">
            {titleLines.map((line, index) => (
              <tspan key={line} x={0} y={titleFirstY + index * 14}>
                {line.toUpperCase()}
              </tspan>
            ))}
          </text>
          <text className="bloom-core-blurb" textAnchor="middle">
            {blurbLines.map((line, index) => (
              <tspan key={line} x={0} y={blurbFirstY + index * 7}>
                {line}
              </tspan>
            ))}
          </text>
          <text className="bloom-core-count" textAnchor="middle" y={21}>
            {count}
          </text>
          <text className="bloom-core-key" textAnchor="middle" y={39}>
            CLICK TO PIN
          </text>
        </>
      )}
    </g>
  );
}

/**
 * The core is deliberately compact, so keep descriptions to two balanced
 * lines. IBM Plex Mono has a fixed advance, making character count a stable
 * proxy for rendered width without measuring text in the browser.
 */
function balancedBlurbLines(blurb: string): string[] {
  const maxLineLength = 54;
  if (blurb.length <= maxLineLength) return [blurb];

  const words = blurb.split(' ');
  let best = [blurb];
  let bestScore = Number.POSITIVE_INFINITY;

  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(' ');
    const second = words.slice(index).join(' ');
    const overflow =
      Math.max(0, first.length - maxLineLength) +
      Math.max(0, second.length - maxLineLength);
    const score = overflow * 100 + Math.abs(first.length - second.length);

    if (score < bestScore) {
      best = [first, second];
      bestScore = score;
    }
  }

  return best;
}

function YearRingLabel({
  atlas,
  year,
  radius,
}: {
  atlas: AreaAtlas;
  year: number;
  radius: number;
}) {
  const angle = Math.PI * 0.86;
  const point = areaPoint(atlas, radius, angle);
  const tick = areaPoint(atlas, radius + 6, angle);
  return (
    <g className="area-year-label">
      <line x1={point.x} y1={point.y} x2={tick.x} y2={tick.y} />
      <text x={tick.x - 3} y={tick.y + 3} textAnchor="end">
        {year}
      </text>
    </g>
  );
}

interface Point {
  x: number;
  y: number;
}

function areaPoint(atlas: AreaAtlas, radius: number, angle: number): Point {
  // Rounded here rather than at each call site, so every path, spine, leader and
  // label built from this point is identical on the server and the client.
  return {
    x: stable(atlas.cx + Math.cos(angle) * radius * atlas.xScale),
    y: stable(atlas.cy + Math.sin(angle) * radius),
  };
}

function areaSectorPath(atlas: AreaAtlas, sector: AreaSector): string {
  const innerStart = areaPoint(atlas, atlas.innerRadius, sector.startAngle);
  const outerStart = areaPoint(atlas, atlas.outerRadius, sector.startAngle);
  const outerEnd = areaPoint(atlas, atlas.outerRadius, sector.endAngle);
  const innerEnd = areaPoint(atlas, atlas.innerRadius, sector.endAngle);
  const largeArc = sector.endAngle - sector.startAngle > Math.PI ? 1 : 0;
  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${stable(atlas.outerRadius * atlas.xScale)} ${atlas.outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${stable(atlas.innerRadius * atlas.xScale)} ${atlas.innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function areaArcPath(atlas: AreaAtlas, sector: AreaSector, radius: number): string {
  const start = areaPoint(atlas, radius, sector.startAngle);
  const end = areaPoint(atlas, radius, sector.endAngle);
  const largeArc = sector.endAngle - sector.startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${stable(radius * atlas.xScale)} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function areaSpinePath(atlas: AreaAtlas, sector: AreaSector): string {
  const start = areaPoint(atlas, atlas.innerRadius + 12, sector.midAngle);
  const end = areaPoint(atlas, atlas.outerRadius - 12, sector.midAngle);
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

function areaLeaderPath(atlas: AreaAtlas, sector: AreaSector): string {
  const start = areaPoint(atlas, atlas.outerRadius + 3, sector.midAngle);
  const end = areaPoint(atlas, atlas.labelRadius - 4, sector.midAngle);
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

function areaLabelPlacement(atlas: AreaAtlas, sector: AreaSector) {
  const point = areaPoint(atlas, atlas.labelRadius, sector.midAngle);
  // Rounded before the comparisons below, so the chosen text anchor can't differ
  // between the server and the client either.
  const cosine = stable(Math.cos(sector.midAngle), 6);
  const sine = stable(Math.sin(sector.midAngle), 6);
  const anchor: 'start' | 'middle' | 'end' =
    cosine > 0.22 ? 'start' : cosine < -0.22 ? 'end' : 'middle';
  const lines = AREA_LABEL_LINES[sector.id].length;
  const x = point.x + (anchor === 'start' ? 6 : anchor === 'end' ? -6 : 0);

  if (sine > 0.68) {
    // Bottom labels also live wholly outside the rim: the leader ends first,
    // followed by the title and count as one compact annotation.
    const firstLineY = -6;
    return {
      x,
      y: point.y,
      anchor,
      firstLineY,
      countY: firstLineY + lines * 11 + 3,
    };
  }
  if (sine < -0.68) {
    // Keep the whole label outside the petal. Previously the title sat above
    // the rim while its count dropped below it, making this one field look like
    // two unrelated annotations.
    const firstLineY = -(lines * 11) / 2 - 1;
    return {
      x,
      y: point.y,
      anchor,
      firstLineY,
      countY: firstLineY + lines * 11 + 3,
    };
  }

  const firstLineY = -((lines - 1) * 11) / 2;
  return {
    x,
    y: point.y,
    anchor,
    firstLineY,
    countY: firstLineY + lines * 11 + 3,
  };
}
