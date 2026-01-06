import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/runtime/index.ts',
    'src/runtime/focus/index.ts',
    'src/runtime/keyboard/index.ts',
    'src/runtime/aria/index.ts',
    'src/runtime/announce/index.ts',
    'src/runtime/env/index.ts',
    'src/runtime/errors/index.ts',
  ],
  format: ['esm', 'cjs'],
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
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  // Support Vite/Next.js dual package
  shims: false,
  // Ensure proper CJS interop
  cjsInterop: true,
  // Bundle all internal dependencies
  external: [],
  // Add banner for source attribution
  banner: {
    js: '// @a13y/core - Runtime accessibility utilities',
  },
});
