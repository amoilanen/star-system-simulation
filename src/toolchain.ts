// Trivial pure function used by the toolchain smoke test to assert that the
// TypeScript + Vitest pipeline runs end to end. Replaced/extended by real
// modules in later steps.
export function add(a: number, b: number): number {
  return a + b;
}
