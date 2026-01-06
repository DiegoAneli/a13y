import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/hooks/index.ts', 'src/components/index.ts', 'src/patterns/index.ts'],
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
  external: ['react', 'react-dom', 'react/jsx-runtime', '@a13y/core', '@a13y/devtools'],
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  // Support Vite/Next.js
  shims: false,
  // Ensure React is treated as external
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.banner = {
      js: "'use client';",
    };
  },
  // Add banner for source attribution
  banner: {
    js: '// @a13y/react - Runtime accessibility hooks and components',
  },
});
