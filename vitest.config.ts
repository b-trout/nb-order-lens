import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude compiled extension output. tsc emits to out/ and Vitest would
    // otherwise pick up out/validator.test.js as a CommonJS module, causing
    // require('vitest') to fail. This is a belt-and-suspenders guard in case
    // the tsconfig exclude for test files is ever changed.
    exclude: ['**/node_modules/**', '**/out/**'],
  },
});
