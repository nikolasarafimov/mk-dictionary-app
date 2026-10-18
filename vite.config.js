
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function excludeFullDatabaseFromBuild() {
  let outputDirectory = null

  return {
    name: 'exclude-full-dictionary-database',

    apply: 'build',

    configResolved(config) {
      outputDirectory = resolve(
        config.root,
        config.build.outDir,
      )
    },

    closeBundle() {
      if (!outputDirectory) {
        return
      }

      rmSync(
        resolve(outputDirectory, 'msd-mk.sqlite'),
        { force: true },
      )
    },
  }
}

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    excludeFullDatabaseFromBuild(),
  ],

  server: {
    port: 8080,
  },
})
