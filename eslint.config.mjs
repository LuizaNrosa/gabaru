import { FlatCompat } from "@eslint/eslintrc";

/**
 * ESLint flat config do Gabaru (ESLint 9).
 *
 * Base: eslint-config-next (core-web-vitals + TypeScript), via FlatCompat.
 * O `next lint` foi removido no Next 16; a configuração flat é o caminho
 * oficial e roda direto com `eslint .` (script `npm run lint`, também no CI).
 */
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "next-env.d.ts",
      // Acervos e ferramentas de coleta fora do bundle do site:
      "APK/**",
      "ferramentas/**",
      "content/**",
      "docs/**",
      "scripts/**",
      "tests/**",
    ],
  },
  {
    rules: {
      // O projeto usa `_` para parâmetros intencionalmente não usados
      // (assinaturas de interface/adapter) — não é descuido.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
