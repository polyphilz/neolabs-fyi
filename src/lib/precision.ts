/**
 * Round a computed coordinate on its way into the DOM.
 *
 * `Math.sin`, `Math.cos` and `Math.pow` are explicitly not required by the
 * ECMAScript spec to be correctly rounded, so the V8 that prerenders the HTML in
 * Node and the V8 that hydrates it in the browser are free to disagree in the
 * last bit. Interpolated into an SVG path at full double precision, that one bit
 * becomes a different string — `518.5032243091947` against `518.5032243091948` —
 * and React throws away the server markup as a hydration mismatch.
 *
 * Rounding at the boundary makes the two agree. Three decimals is orders of
 * magnitude below a device pixel at this viewBox, and it absorbs any upstream
 * difference of a few ULP, so intermediate values don't each need pinning. It
 * also meaningfully shortens the emitted paths.
 */
export function stable(n: number, decimals = 3): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}
