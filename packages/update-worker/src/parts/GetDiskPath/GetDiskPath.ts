import { RendererWorker } from '@lvce-editor/rpc-registry'
import { getBaseName } from '../GetBaseName/GetBaseName.ts'

export const getDiskPath = async (downloadUrl: string): Promise<string> => {
  // @ts-ignore
  const cacheDir = await RendererWorker.invoke('PlatformPaths.getCacheUri')
  const baseName = getBaseName(downloadUrl)
  const diskPath = `${cacheDir}/auto-updater/${baseName}`
  return diskPath
}
