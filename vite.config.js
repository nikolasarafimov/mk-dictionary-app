import {
  rmSync,
} from 'node:fs'

import {
  resolve,
} from 'node:path'

import {
  defineConfig,
} from 'vite'

import react
  from '@vitejs/plugin-react'


function excludeFullDatabaseFromBuild() {
  return {
    name: 'exclude-full-dictionary-database',

    apply: 'build',

    closeBundle() {
      const fullDatabasePath =
        resolve(
          'dist',
          'msd-mk.sqlite',
        )

      rmSync(
        fullDatabasePath,
        {
          force: true,
        },
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