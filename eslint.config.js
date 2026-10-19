
import js from '@eslint/js'
import globals from 'globals'

import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: [
      'dist/',
      'coverage/',
    ],
  },

  {
    files: [
      '**/*.{js,jsx}',
    ],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      ...js.configs.recommended.rules,

      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: [
      'src/**/*.{js,jsx}',
    ],

    ignores: [
      'src/db/sqlWorker.js',
    ],

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
    },

    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,

      'react/prop-types': 'off',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    files: [
      'src/**/*.jsx',
    ],

    plugins: {
      'react-refresh': reactRefresh,
    },

    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
    },
  },

  {
    files: [
      'src/db/sqlWorker.js',
    ],

    languageOptions: {
      globals: {
        ...globals.worker,
      },
    },
  },

  {
    files: [
      'api/**/*.{js,mjs}',
    ],

    languageOptions: {
      globals: {
        ...globals.node,
        Response: 'readonly',
      },
    },
  },

  {
    files: [
      'vite.config.js',
      'eslint.config.js',
    ],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]