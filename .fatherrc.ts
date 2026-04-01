import { defineConfig } from 'father';

export default defineConfig({
  esm: { input: 'src', output: 'es' },
  cjs: { input: 'src', output: 'lib' },
  sourcemap: true,
});
