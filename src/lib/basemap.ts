import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import land110m from 'world-atlas/land-110m.json' with { type: 'json' };

import { LABS } from '../data/labs';

/**
 * The world map is generated at BUILD TIME and shipped as plain path strings.
 * That keeps d3-geo and the 100KB topojson out of the client bundle entirely —
 * the island only ever deals with numbers.
 */

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 500;

export interface Basemap {
  width: number;
  height: number;
  /** Landmass outline. */
  land: string;
  /** Lat/lon grid, drawn as a hairline behind the land. */
  graticule: string;
  /** slug -> projected position, in basemap coordinates. */
  positions: Record<string, { x: number; y: number }>;
}

export function buildBasemap(): Basemap {
  const projection = geoNaturalEarth1().fitExtent(
    [
      [8, 8],
      [MAP_WIDTH - 8, MAP_HEIGHT - 8],
    ],
    { type: 'Sphere' }
  );
  // One decimal place is well below a pixel at this scale and roughly halves
  // the serialised path, which is the bulk of the homepage's HTML weight.
  const path = geoPath(projection).digits(1);

  const land = feature(
    land110m as unknown as Topology,
    (land110m as unknown as Topology).objects.land
  );

  const positions: Basemap['positions'] = {};
  for (const lab of LABS) {
    const xy = projection([lab.location.lon, lab.location.lat]);
    if (xy) positions[lab.slug] = { x: xy[0], y: xy[1] };
  }

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    land: path(land) ?? '',
    graticule: path(geoGraticule10()) ?? '',
    positions,
  };
}
