import { describe, it, expect } from 'vitest';
import {
  apparentHeightFraction,
  apparentRadius,
  cappedApparentRadius,
  minWorldRadiusForPixels,
  overflowDimming,
  visibleHalfHeight,
} from '../../src/render/screenScale';
import { coronaRadius } from '../../src/render/starVisual';

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

describe('bug 6 — an additive glow must be bounded from ABOVE as well as below', () => {
  const FOV = 55;
  const HEIGHT = 900;
  const MAX_FRACTION = 0.55;

  it('measures apparent size as a resolution-independent fraction of the frame', () => {
    // An object of exactly `visibleHalfHeight` radius spans the whole frame.
    const half = visibleHalfHeight(63, FOV);
    expect(apparentHeightFraction(half, 63, FOV)).toBeCloseTo(1, 10);
    // And it agrees with the pixel projection: fraction × height = px diameter.
    expect(projectedPixels(half, 63, FOV, HEIGHT)).toBeCloseTo(HEIGHT, 6);
    expect(apparentHeightFraction(half / 2, 63, FOV)).toBeCloseTo(0.5, 10);
    // Twice as far away ⇒ half the apparent size.
    expect(apparentHeightFraction(1, 126, FOV)).toBeCloseTo(
      apparentHeightFraction(1, 63, FOV) / 2,
      10,
    );
  });

  it('returns 0 rather than NaN/Infinity for degenerate inputs', () => {
    for (const [r, d, fov] of [
      [1, 0, FOV],
      [1, -5, FOV],
      [1, 63, 0],
      [1, 63, 180],
      [0, 63, FOV],
      [Number.NaN, 63, FOV],
    ] as [number, number, number][]) {
      expect(apparentHeightFraction(r, d, fov)).toBe(0);
    }
    expect(visibleHalfHeight(0, FOV)).toBe(0);
    expect(visibleHalfHeight(63, 200)).toBe(0);
  });

  it('never lets the capped radius exceed the cap, at any radius/glow/distance', () => {
    // The full space the corona lives in: the star's drawn radius across its
    // whole life (white dwarf → supernova fireball), the glow multiplier's whole
    // range, and every camera distance from a close fly-by to the outer system.
    for (const starRadius of [4.3e-5, 0.00465, 0.05, 1.16, 1.63, 10, 17.5]) {
      for (const glow of [0, 0.4, 1, 2.4, 5.5, 14]) {
        const wanted = coronaRadius(starRadius, glow);
        for (const distance of [5e-4, 0.02, 0.5, 5, 63, 500, 5000]) {
          const floored = apparentRadius(wanted, distance, FOV, HEIGHT, 20);
          const capped = cappedApparentRadius(floored, distance, FOV, MAX_FRACTION);
          expect(
            apparentHeightFraction(capped, distance, FOV),
            `r ${starRadius} glow ${glow} d ${distance}`,
          ).toBeLessThanOrEqual(MAX_FRACTION + 1e-12);
          // The cap only ever shrinks; it never invents size.
          expect(capped).toBeLessThanOrEqual(floored);
          expect(capped).toBeGreaterThan(0);
        }
      }
    }
  });

  it('leaves a halo that already fits completely untouched', () => {
    // A main-sequence star seen from the default framing distance: ~0.037 AU of
    // halo against a 32 AU half-height — nowhere near the cap.
    const wanted = coronaRadius(0.00465, 1);
    const floored = apparentRadius(wanted, 63, FOV, HEIGHT, 20);
    expect(cappedApparentRadius(floored, 63, FOV, MAX_FRACTION)).toBe(floored);
  });

  it('falls back to the true radius when there is no usable projection', () => {
    expect(cappedApparentRadius(5, 0, FOV, MAX_FRACTION)).toBe(5);
    expect(cappedApparentRadius(5, 63, FOV, 0)).toBe(5);
    expect(cappedApparentRadius(-5, 63, FOV, MAX_FRACTION)).toBe(0);
  });

  it('dims an over-large shell in proportion to how far past the cap it reaches', () => {
    // A 75 AU nebula seen from 63 AU spans ~2.3 frames; brightness is scaled by
    // cap/wanted so the light it adds to the frame stays roughly constant.
    const fraction = apparentHeightFraction(75, 63, FOV);
    expect(fraction).toBeGreaterThan(1.1);
    expect(overflowDimming(fraction, 1.1)).toBeCloseTo(1.1 / fraction, 10);
    // Never brightens, never negative, and exactly 1 while the shell fits.
    for (const f of [0, 0.1, 0.5, 1, 1.1, 5, 100]) {
      const d = overflowDimming(f, 1.1);
      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThanOrEqual(1);
    }
    expect(overflowDimming(0.5, 1.1)).toBe(1);
    expect(overflowDimming(Number.NaN, 1.1)).toBe(1);
    expect(overflowDimming(2, 0)).toBe(1);
  });
});
