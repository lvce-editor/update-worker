import { RendererWorker } from '@lvce-editor/rpc-registry'

const getBaseName = (downloadUrl: string): string => {
  const lastSlashIndex = downloadUrl.lastIndexOf('/')
  return downloadUrl.slice(lastSlashIndex + 1)
}

export const downloadToDisk = async (downloadUrl: string, response: Response): Promise<string> => {
  // @ts-ignore
  const cacheDir = await RendererWorker.invoke('PlatformPaths.getCachePath')
  const baseName = getBaseName(downloadUrl)
  const diskPath = `${cacheDir}/${baseName}`
  const blob = await response.blob()
  // @ts-ignore
  await RendererWorker.invoke('FileSystem.writeBlob', diskPath, blob)
  return diskPath
}
