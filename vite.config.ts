/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// Vite config for the static, 100% client-side bundle. The WASM plugins allow
// importing the Rust-compiled kernel produced by `wasm-pack build wasm --target web`.
export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  test: {
    environment: 'node',
    include: ['test/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
  },
});
