import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/runtime/index.ts',
    'src/runtime/invariants/index.ts',
    'src/runtime/validators/index.ts',
    'src/runtime/warnings/index.ts',
  ],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: {
    preset: 'recommended',
  },
  minify: false, // Keep readable for debugging
  platform: 'browser',
  target: 'es2020',
  outDir: 'dist',
  // External dependencies (not bundled)
  external: ['@a13y/core'],
  // Always in development mode (devtools are development-only)
  define: {
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  // Support Vite/Next.js
  shims: false,
  // Add banner for source attribution
  banner: {
    js: '// @a13y/devtools - Development-time validators (tree-shakeable in production)',
  },
});
