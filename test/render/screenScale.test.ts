import { describe, it, expect } from 'vitest';
import { apparentRadius, minWorldRadiusForPixels } from '../../src/render/screenScale';

/**
 * Projected DIAMETER in pixels of a sphere of `radius` at `distance`, from the
 * standard perspective relation `pixelsPerWorldUnit = height / (2·d·tan(fov/2))`.
 * Independent re-derivation, so the module is checked rather than restated.
 */
function projectedPixels(
  radius: number,
  distance: number,
  fovDegrees: number,
  viewportHeightPx: number,
): number {
  const halfFov = (fovDegrees * Math.PI) / 180 / 2;
  return (2 * radius * viewportHeightPx) / (2 * distance * Math.tan(halfFov));
}

describe('minWorldRadiusForPixels', () => {
  it('returns exactly the radius that projects to the requested pixel size', () => {
    const r = minWorldRadiusForPixels(120, 55, 900, 7);
    expect(projectedPixels(r, 120, 55, 900)).toBeCloseTo(7, 6);
  });

  it('scales linearly with distance (constant apparent size)', () => {
    const near = minWorldRadiusForPixels(50, 55, 900, 7);
    const far = minWorldRadiusForPixels(500, 55, 900, 7);
    expect(far).toBeCloseTo(near * 10, 10);
  });

  it('needs a larger world radius on a shorter viewport', () => {
    expect(minWorldRadiusForPixels(100, 55, 400, 7)).toBeGreaterThan(
      minWorldRadiusForPixels(100, 55, 1600, 7),
    );
  });

  it('returns 0 for degenerate inputs rather than NaN/Infinity', () => {
    const cases: [number, number, number, number][] = [
      [0, 55, 900, 7],
      [-5, 55, 900, 7],
      [100, 0, 900, 7],
      [100, 180, 900, 7],
      [100, 55, 0, 7],
      [100, 55, 900, 0],
    ];
    for (const [distance, fov, height, pixels] of cases) {
      const value = minWorldRadiusForPixels(distance, fov, height, pixels);
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBe(0);
    }
  });
});

describe('apparentRadius', () => {
  it('keeps the true radius when the body is already big enough on screen', () => {
    // A red giant (1.2 AU) seen from 30 AU is far larger than the floor.
    expect(apparentRadius(1.2, 30, 55, 900, 7)).toBe(1.2);
  });

  it('floors an astronomically small body so it stays visible when zoomed out', () => {
    // A planet of 0.012 AU viewed from 120 AU would be a small fraction of a
    // pixel; the floor lifts it to exactly the minimum apparent size.
    const drawn = apparentRadius(0.012, 120, 55, 900, 7);
    expect(drawn).toBeGreaterThan(0.012);
    expect(projectedPixels(drawn, 120, 55, 900)).toBeCloseTo(7, 6);
  });

  it('hands back the true radius once the camera is close enough', () => {
    // Zooming in from 120 AU to 0.2 AU: the true radius takes over, so the
    // correct star:planet:orbit proportions become visible up close.
    expect(apparentRadius(0.012, 0.2, 55, 900, 7)).toBe(0.012);
  });

  it('never returns a negative radius', () => {
    expect(apparentRadius(-1, 100, 55, 900, 7)).toBeGreaterThan(0);
    expect(apparentRadius(-1, 0, 55, 900, 7)).toBe(0);
  });
});
