import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      globals: true,
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
