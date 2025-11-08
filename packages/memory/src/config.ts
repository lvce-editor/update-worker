import { join } from 'node:path'
import { root } from './root.ts'

export const threshold = 410_000

export const instantiations = 5000

export const instantiationsPath = join(root, 'packages', 'update-worker')

export const workerPath = join(root, '.tmp/dist/dist/updateWorkerMain.js')

export const playwrightPath = import.meta.resolve('../../e2e/node_modules/playwright/index.mjs').toString()
