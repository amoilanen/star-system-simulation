import { describe, it, expect } from 'vitest';
import { add } from '../src/toolchain';

// Smoke test: proves the TypeScript + Vitest toolchain is wired up correctly.
describe('toolchain smoke test', () => {
  it('runs the test runner against a pure function', () => {
    expect(add(2, 3)).toBe(5);
  });
});
