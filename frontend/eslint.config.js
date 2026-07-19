import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
// 1. 🌟 최신 플랫 컴피그를 지원하는 tailwindcss 플러그인을 직접 임포트합니다.
import tailwindcss from 'eslint-plugin-tailwindcss'
import vitest from '@vitest/eslint-plugin'

// ESM 환경에서 __dirname을 안전하게 받아오기 위한 설정
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 구형 설정을 최신 Flat Config로 변환해주는 호환성 브릿지 엔진 가동
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

export default [
  {
    // 글로벌 제외(Ignore) 설정
    ignores: ['**/node_modules/*', 'dist/*', 'src/routeTree.gen.ts'],
  },

  // 기존 구형 도면 변환 래퍼
  ...compat.config({
    env: {
      node: true,
      es6: true,
    },
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    extends: ['eslint:recommended'],
    plugins: ['check-file'],
    overrides: [
      {
        files: ['**/*.ts', '**/*.tsx'],
        parser: '@typescript-eslint/parser',
        settings: {
          react: { version: 'detect' },
          'import/resolver': {
            typescript: {},
          },
        },
        env: {
          browser: true,
          node: true,
          es6: true,
        },
        extends: [
          'eslint:recommended',
          'plugin:import/errors',
          'plugin:import/warnings',
          'plugin:import/typescript',
          'plugin:@typescript-eslint/recommended',
          'plugin:react/recommended',
          'plugin:react-hooks/recommended',
          'plugin:jsx-a11y/recommended',
          'plugin:prettier/recommended',
          'plugin:testing-library/react',
          'plugin:jest-dom/recommended',
        ],
        rules: {
          'import/no-restricted-paths': [
            'error',
            {
              zones: [
                {
                  target: './src/features/auth',
                  from: './src/features',
                  except: ['./auth'],
                },
                {
                  target: './src/features/comments',
                  from: './src/features',
                  except: ['./comments'],
                },
                {
                  target: './src/features/discussions',
                  from: './src/features',
                  except: ['./discussions'],
                },
                {
                  target: './src/features/teams',
                  from: './src/features',
                  except: ['./teams'],
                },
                {
                  target: './src/features/users',
                  from: './src/features',
                  except: ['./users'],
                },
                {
                  target: './src/features',
                  from: './src/app',
                },
                {
                  target: [
                    './src/components',
                    './src/hooks',
                    './src/lib',
                    './src/types',
                    './src/utils',
                  ],
                  from: ['./src/features', './src/app'],
                },
              ],
            },
          ],
          'import/no-cycle': 'error',
          'linebreak-style': ['error', 'unix'],
          'react/prop-types': 'off',
          'import/extensions': [
            'error',
            'never',
            {
              ts: 'never',
              tsx: 'never',
              js: 'never',
              jsx: 'never',
              css: 'always',
              json: 'always',
            },
          ],
          'import/order': [
            'error',
            {
              groups: [
                'builtin',
                'external',
                'internal',
                'parent',
                'sibling',
                'index',
                'object',
              ],
              'newlines-between': 'always',
              alphabetize: { order: 'asc', caseInsensitive: true },
            },
          ],
          'import/default': 'off',
          'import/no-named-as-default-member': 'off',
          'import/no-named-as-default': 'off',
          'react/react-in-jsx-scope': 'off',
          'jsx-a11y/anchor-is-valid': 'off',
          '@typescript-eslint/no-unused-vars': ['error'],
          '@typescript-eslint/explicit-function-return-type': ['off'],
          '@typescript-eslint/explicit-module-boundary-types': ['off'],
          '@typescript-eslint/no-empty-function': ['off'],
          '@typescript-eslint/no-explicit-any': ['off'],
          'prettier/prettier': ['error', {}, { usePrettierrc: true }],
          'check-file/filename-naming-convention': [
            'error',
            {
              '**/*.{ts,tsx}': 'KEBAB_CASE',
            },
            {
              ignoreMiddleExtensions: true,
            },
          ],
        },
      },
      {
        plugins: ['check-file'],
        files: ['src/**/!(__tests__)/*'],
        rules: {
          'check-file/folder-naming-convention': [
            'error',
            {
              '**/*': 'KEBAB_CASE',
            },
          ],
        },
      },
    ],
  }),

  // Vitest 플랫 설정 적용
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },

  // 3. 🌟 배열 맨 밑에 최신 플랫 컴피그 스타일로 테일윈드 규칙을 온전하게 병합합니다.
  tailwindcss.configs.recommended,

  {
    settings: {
      tailwindcss: {
        cssConfigPath: './src/styles.css',
      },
    },
  },

  // TanStack Router의 루트 라우터 파일에 대해서는 파일명 규칙(KEBAB_CASE) 예외 처리
  {
    files: ['src/routes/__root.tsx'],
    rules: {
      'check-file/filename-naming-convention': 'off',
    },
  },
]
