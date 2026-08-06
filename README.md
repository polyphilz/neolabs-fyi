# neolabs.fyi

An interactive map of AI neolabs — 63 labs, ~$387B in combined paper valuation,
in four views of one canvas.

```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # static output in dist/
pnpm astro check
```

## Stack

Astro 7 (fully static) + a single React island for the canvas + Tailwind 4 for
the reset, with hand-written CSS for everything visual. TypeScript throughout.

Astro rather than a Vite SPA because the SEO surface here is the **63 per-lab
pages** (`/labs/<slug>`) — the long-tail queries are "SSI valuation", "who
founded Physical Intelligence". Those ship as prerendered HTML with JSON-LD
`Organization` markup and zero JavaScript. The canvas is the shareable thing;
the lab pages are the thing that ranks.

The homepage is a full-bleed canvas with no body copy, so the crawlable
inventory of all 63 labs lives on **`/table`** — linked from the floating nav,
from the homepage's `Dataset` JSON-LD as its `distribution`, and in the sitemap.
Every lab page is two hops from the homepage. The alternative (63 visually
hidden links under the canvas) would read as cloaking, which isn't worth it.

## Layout of the code

```
src/data/       the dataset and its taxonomy — the source of truth
  types.ts      Lab, Valuation (with qualifiers), Founder, OrgId, DomainId
  labs.ts       all 63 labs
  locations.ts  shared city records, so geo clustering compares identity
  taxonomy.ts   domains, lineage hubs, colour ramps
src/lib/
  layout.ts     the four layouts: target positions + decorations per view
  basemap.ts    BUILD-TIME world map → plain SVG path strings
  filters.ts    filter state + URL round-tripping
  color.ts      valuation → sequential ramp step
  format.ts     valuation/label formatting, canvas label fitting
src/components/canvas/
  Explorer.tsx      the island: state, URL sync, composition
  LabCanvas.tsx     SVG rendering + interaction
  useSimulation.ts  one long-lived d3-force sim shared by all four views
  useViewport.ts    hand-rolled pan/zoom
src/pages/      index (full-bleed canvas), table, about, labs/[slug]
```

## Decisions worth knowing

**The valuation view carries no positional encoding.** It was originally a
beeswarm along a founding-year axis, but only 4 of 63 labs predate 2022, so the
axis bought a lot of dead canvas for very little. Year now lives entirely in the
timeline filter, and the view says one thing: how far apart these numbers are.

**Bubble area is proportional to valuation** (radius ∝ √value), not log-scaled.
A $100B lab really is ~300× the area of a $335M one. Log scaling would flatten
exactly the disparity the site exists to show. Small bubbles get a radius floor
and the canvas zooms, which is the cost of that choice.

**Colour encodes valuation, not research area.** There are 17+ research areas
and 8 domain buckets; no validated categorical palette keeps that many hues
distinguishable — including for normal colour vision, where several pairs fall
below the separation floor. So magnitude gets the single-hue sequential ramp
(reinforcing bubble size), and research area is carried by position, labels,
tooltip, and the table. The four all-pairs-safe categorical slots are reserved
in `taxonomy.ts` for any genuine ≤4-way split.

**Label ink is per ramp step.** The ramp runs light→dark in one theme and
dark→light in the other, so a single "on-fill" colour can't work. Each step gets
whichever of black/white has more contrast; every pair clears 4.4:1.

**One simulation, four layouts.** Switching views moves each node's target and
re-heats the sim rather than rebuilding it, so the canvas rearranges instead of
cutting. That continuity is what makes it feel like one artifact.

**The map is computed at build time.** `basemap.ts` runs d3-geo and the world
topojson during the build and ships only path strings and projected `{x, y}`
per lab — the client bundle contains no geo library and no topology.

**Wheel and gesture listeners are attached natively, not via React.** React
registers wheel handlers passively at the root, which silently turns
`preventDefault()` into a no-op — the symptom being that a trackpad pinch zooms
the entire page instead of the canvas. `useViewport` attaches its own
`{ passive: false }` listeners, cancels Safari's `gesture*` events, and handles
two-pointer pinch for touch. Convention is Google Maps': pinch zooms, two-finger
scroll pans.

**Valuation qualifiers are preserved.** `>$1B`, `~$4B`, `<$500M`, ranges, and
`rumored` are all distinct states of knowledge and render as such. Flattening
them to one number would be the most misleading thing this site could do.

## Data caveats

Valuations, research areas, founders, and "known for" come from the published
neolab list. **Headquarters and founder prior-affiliations are not in that
source** — they're compiled from public reporting per lab and are the most
likely thing to be wrong. Where a lab is split across two sites (SSI: Palo Alto
+ Tel Aviv; AMI: New York + Paris), the primary office is used.

## Not built yet

- OG images per lab (there's currently no `og:image`)
- "Last updated" / suggest-an-edit flow
- Mobile pass — the canvas works but the top islands wrap awkwardly
- Further views: capital efficiency, investor overlap, status/graveyard
