// Minimum apparent (screen-space) size for astronomically small bodies.
//
// The simulation draws the star and planets at SOLAR-SYSTEM proportions: a body
// is a minute fraction of its own orbit (Jupiter's radius is 1/11000 of its
// orbit). That is what makes the system read as real rather than arcade — but it
// also means that from a viewpoint that frames the whole system, every body is
// far below one pixel.
//
// Real astronomy software (Celestia, SpaceEngine, NASA's Eyes) solves this the
// same way: a body is never drawn smaller than a few pixels, so it reads as a
// point of light when you are far away — exactly as a planet looks in the night
// sky — and shrinks back to its true relative size as you zoom in on it. The
// PHYSICS and the DISTANCES are untouched; only the drawn size has a floor.
//
// Pure and Three.js-free so the projection math is unit-testable.

/**
 * World-space radius that subtends `minPixels` of screen height for an object
 * `distance` away from a perspective camera.
 *
 * At distance d the vertical extent visible to a camera of vertical field of
 * view `fovDegrees` is `2·d·tan(fov/2)`, so one world unit covers
 * `viewportHeightPx / (2·d·tan(fov/2))` pixels. Inverting for a diameter of
 * `minPixels` gives the radius below. Returns 0 for degenerate inputs.
 */
export function minWorldRadiusForPixels(
  distance: number,
  fovDegrees: number,
  viewportHeightPx: number,
  minPixels: number,
): number {
  if (
    !(distance > 0) ||
    !(fovDegrees > 0) ||
    !(viewportHeightPx > 0) ||
    !(minPixels > 0) ||
    fovDegrees >= 180
  ) {
    return 0;
  }
  const halfFov = (fovDegrees * Math.PI) / 180 / 2;
  return (minPixels * distance * Math.tan(halfFov)) / viewportHeightPx;
}

/**
 * The radius a body should actually be DRAWN at: its true radius, unless that
 * would fall below `minPixels` on screen, in which case the floor wins.
 *
 * Zoomed out, bodies read as points of light of a constant apparent size; zoom
 * in and the true radius takes over, so the correct star:planet:orbit
 * proportions become visible. Pure.
 */
export function apparentRadius(
  trueRadius: number,
  distance: number,
  fovDegrees: number,
  viewportHeightPx: number,
  minPixels: number,
): number {
  const floor = minWorldRadiusForPixels(distance, fovDegrees, viewportHeightPx, minPixels);
  return Math.max(Math.max(trueRadius, 0), floor);
}

/**
 * Half the world-space height visible to a perspective camera `distance` away:
 * `d · tan(fov/2)`. An object of exactly this radius spans the full viewport
 * height with its DIAMETER. Returns 0 for degenerate inputs.
 */
export function visibleHalfHeight(distance: number, fovDegrees: number): number {
  if (!(distance > 0) || !(fovDegrees > 0) || fovDegrees >= 180) {
    return 0;
  }
  return distance * Math.tan((fovDegrees * Math.PI) / 180 / 2);
}

/**
 * Apparent size of a sphere of `radius` at `distance`, as a fraction of the
 * VIEWPORT HEIGHT its diameter spans: 1 = exactly fills the frame vertically,
 * 2 = twice as tall as the frame. Resolution-independent (it is an angular
 * measure), so it is the natural unit for "this must not swamp the screen".
 * Returns 0 for degenerate inputs.
 */
export function apparentHeightFraction(
  radius: number,
  distance: number,
  fovDegrees: number,
): number {
  const half = visibleHalfHeight(distance, fovDegrees);
  if (!(half > 0) || !(radius > 0)) {
    return 0;
  }
  return radius / half;
}

/**
 * The radius a GLOW should actually be drawn at: never larger than
 * `maxHeightFraction` of the viewport height (see
 * {@link apparentHeightFraction}).
 *
 * Additive halos are the one class of object that must be bounded from ABOVE as
 * well as below. A supernova's corona quad grew to `radius · 7.5` in world
 * space — up to 262 AU across against a ~62 AU visible height — so the star's
 * glow simply washed the frame white (reported bug 6). Capping the AREA and
 * letting the excess feed brightness/bloom instead keeps the flash blinding
 * without turning it into an opaque wall. Pure.
 */
export function cappedApparentRadius(
  radius: number,
  distance: number,
  fovDegrees: number,
  maxHeightFraction: number,
): number {
  const half = visibleHalfHeight(distance, fovDegrees);
  const safeRadius = Math.max(radius, 0);
  if (!(half > 0) || !(maxHeightFraction > 0)) {
    return safeRadius;
  }
  return Math.min(safeRadius, maxHeightFraction * half);
}

/**
 * Brightness factor that keeps an additive object's TOTAL contribution bounded
 * once its apparent size has been capped: `cap / wanted`, i.e. inversely
 * proportional to how far past the cap it wanted to grow (1 while it fits).
 *
 * Used for the blast shell, which must stay physically large — it is the same
 * shell as the ejecta particles, so shrinking it would desynchronise the two —
 * but must not become a bright wall in front of the camera. Scaling its
 * brightness down by the same ratio its screen area exceeds the cap by leaves
 * the light it adds to the frame roughly constant. Pure.
 */
export function overflowDimming(wantedHeightFraction: number, maxHeightFraction: number): number {
  if (!(wantedHeightFraction > 0) || !(maxHeightFraction > 0)) {
    return 1;
  }
  return Math.min(1, maxHeightFraction / wantedHeightFraction);
}
