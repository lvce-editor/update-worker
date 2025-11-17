import { execa } from 'execa'
import { root } from './root.js'

const main = async () => {
  execa(
    'node',
    [
      `packages/build/node_modules/esbuild/bin/esbuild`,
      '--format=esm',
      '--bundle',
      '--external:node:buffer',
      '--external:electron',
      '--external:ws',
      '--external:node:worker_threads',
      '--watch',
      'packages/update-worker/src/updateWorkerMain.ts',
      '--outfile=.tmp/dist/dist/updateWorkerMain.js',
    ],
    {
      cwd: root,
      stdio: 'inherit',
    },
  )
}

main()
