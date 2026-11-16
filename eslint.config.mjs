import { defineConfig, globalIgnores } from 'eslint/config';
import security from 'eslint-plugin-security';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  security.configs.recommended,
  {files:['APK/**/*.{ts,tsx}'],rules:{'@next/next/no-html-link-for-pages':'off','@next/next/no-img-element':'off','@typescript-eslint/no-require-imports':'off'}},
  {rules:{'security/detect-eval-with-expression':'error','security/detect-child-process':'error','security/detect-disable-mustache-escape':'error','security/detect-non-literal-require':'error','security/detect-bidi-characters':'error'}},
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '.agents/**', '.codex/**']),
]);
