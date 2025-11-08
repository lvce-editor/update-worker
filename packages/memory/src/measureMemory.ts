import { measureMemory } from '@lvce-editor/measure-memory'
import { playwrightPath, threshold, workerPath, instantiations, instantiationsPath } from './config.ts'

const main = async () => {
  await measureMemory({
    playwrightPath,
    workerPath,
    threshold,
    instantiations,
    instantiationsPath,
  })
}

main()
