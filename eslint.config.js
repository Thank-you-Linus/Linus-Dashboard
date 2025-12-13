// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import litPlugin from 'eslint-plugin-lit';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Base ESLint recommended rules
  eslint.configs.recommended,
  
  // TypeScript recommended rules (using recommended instead of strict like HA)
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  
  // Prettier config (disable conflicting rules)
  prettierConfig,
  
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      'custom_components/linus_dashboard/www/',
      'ha-env/',
      'build-scripts/',
      '**/*.cjs',
    ],
  },
  
  // Main configuration - Following Home Assistant's ESLint config
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        __DEV__: 'readonly',
        __BUILD__: 'readonly',
        __VERSION__: 'readonly',
        __STATIC_PATH__: 'readonly',
        __LINUS_DASHBOARD__: 'readonly',
        // Browser globals
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        customElements: 'readonly',
        CustomEvent: 'readonly',
      },
    },
    
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import': importPlugin,
      'unused-imports': unusedImports,
      'lit': litPlugin,
    },
    
    rules: {
      // Align with Home Assistant rules
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-bitwise': 'error',
      'no-restricted-globals': ['error', 'event'],
      'no-underscore-dangle': 'off', // Allow underscores (private methods)
      'no-plusplus': 'off',
      'no-continue': 'off',
      'no-param-reassign': 'off',
      'no-nested-ternary': 'off',
      'prefer-destructuring': 'off',
      'no-use-before-define': 'off',
      
      // TypeScript specific rules - aligned with HA
      '@typescript-eslint/no-unused-vars': [
        'warn', // Reduce to warning - useful but not critical
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Like HA - they deal with lots of dynamic data
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off', // Like HA
      '@typescript-eslint/ban-ts-comment': 'off', // Like HA
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      
      // Naming conventions - following HA's rules
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['objectLiteralProperty', 'objectLiteralMethod'],
          format: null, // Allow any format for object properties (HA API compatibility)
        },
        {
          selector: ['variable'],
          format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'], // Allow PascalCase for module/class imports
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: ['variable'],
          modifiers: ['exported'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'method',
          modifiers: ['public'],
          format: ['camelCase'],
          leadingUnderscore: 'allow', // More permissive
        },
        {
          selector: 'method',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'allow', // More permissive - allow both with and without
        },
        {
          selector: 'parameter',
          format: ['camelCase', 'snake_case', 'UPPER_CASE'], // Allow snake_case for HA API parameters
          leadingUnderscore: 'allow',
        },
      ],
      
      // Import rules - reduce to warning for flexibility
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],
      'import/prefer-default-export': 'off',
      'import/no-default-export': 'off',
      
      // Unused imports - following HA
      'unused-imports/no-unused-imports': 'error',
      
      // Lit specific rules
      'lit/attribute-names': 'error',
      'lit/no-legacy-template-syntax': 'error',
      'lit/no-template-bind': 'error',
      
      // Disable strict type checking rules that don't work well with HA's dynamic data
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'always',
          allowObjectTypes: 'always',
        },
      ],
      
      // Additional rules to relax for HA integration
      'no-unsafe-optional-chaining': 'warn',
      '@typescript-eslint/no-namespace': 'off', // Allow namespaces for type organization
      '@typescript-eslint/no-shadow': 'warn', // Reduce to warning
      'no-irregular-whitespace': 'warn',
      '@typescript-eslint/no-require-imports': 'off', // Allow require for dynamic imports
      '@typescript-eslint/ban-types': 'off', // Allow Function type for callbacks
      '@typescript-eslint/no-unsafe-function-type': 'off', // Allow Function type
    },
  }
);
