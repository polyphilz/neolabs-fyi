Convert this logo into a clean, minimal SVG suitable for rendering as a small monochrome icon (about 40px).

Optimize for exactness and small file size, not for point count.

Requirements:

* Keep curves as curves: use C/Q/A commands. Never flatten curves into long runs of L segments.
* Never trace a raster into many stacked shapes. If the source has a gradient, glow, or shading, reduce it to ONE flat shape. Do not reproduce shading as layered bands.
* Single flat color, no gradients, no filters, no masks, no clip paths, no embedded raster images. I will recolor it myself.
* Transparent: no background and no white fill behind the artwork.
* Keep strokes as strokes, with stroke-width. Do not convert strokes to filled outlines.
* Use simple primitives (circle, rect, path) where the shape is simple. Keep axis-aligned edges exact — H/V commands, whole numbers where possible.
* Use fill-rule="evenodd" with subpaths for holes and counters (eyes, the inside of an O), so holes are genuinely transparent rather than painted over.
* No transform attributes: bake all translation/scaling into the coordinates.
* Set the viewBox to the artwork's true bounding box, tight to the ink, with no padding and no clipping. Verify nothing extends outside the viewBox.
* Target under 5KB. Anything over 20KB means something went wrong — stop and simplify instead of shipping it.

The logo is in this directory as: ???
