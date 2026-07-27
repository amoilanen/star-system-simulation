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
