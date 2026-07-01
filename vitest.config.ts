import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      globals: true,
      // Excluir tests e2e (los maneja Playwright con `pnpm test:e2e`)
      include: [
        'tests/unit/**/*.test.{ts,tsx}',
        'tests/components/**/*.test.{ts,tsx}',
        'src/features/**/__tests__/**/*.test.{ts,tsx}',
      ],
      exclude: [
        'tests/e2e/**',
        'node_modules/**',
        'dist/**',
        // Stubs que se conservaron al renombrar a .tsx
        'tests/unit/hooks/account.test.ts',
      ],
      coverage: {
        provider: 'v8',
        // TODO Sesión 1: restaurar thresholds a lines:80, statements:80
        // thresholds desactivados en Sesión 0 (setup inicial sin tests de features)
        // thresholds: {
        //   lines: 80,
        //   statements: 80,
        // },
      },
    },
  }),
)
