import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/dist/',
    '**/build/',
    '**/out/',
    '**/.next/',
    '**/.turbo/',
    '**/coverage/',
    '**/playwright-report/',
    '**/test-results/',
  ]),
  {
    name: 'cognitive-guard/javascript',
    files: ['**/*.{js,cjs,mjs,jsx}'],
    extends: [js.configs.recommended],
  },
  {
    name: 'cognitive-guard/typescript',
    files: ['**/*.{ts,cts,mts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintConfigPrettier,
);
