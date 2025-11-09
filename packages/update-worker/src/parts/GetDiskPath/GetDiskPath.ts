import { RendererWorker } from '@lvce-editor/rpc-registry'

const getBaseName = (downloadUrl: string): string => {
  const lastSlashIndex = downloadUrl.lastIndexOf('/')
  return downloadUrl.slice(lastSlashIndex + 1)
}

export const getDiskPath = async (downloadUrl: string): Promise<string> => {
  // @ts-ignore
  const cacheDir = await RendererWorker.invoke('PlatformPaths.getCachePath')
  const baseName = getBaseName(downloadUrl)
  const diskPath = `${cacheDir}/${baseName}`
  return diskPath
}
