import { RendererWorker } from '@lvce-editor/rpc-registry'

const getParentPath = (path: string): string => {
  const slashIndex = path.lastIndexOf('/')
  if (slashIndex === -1) {
    return ''
  }
  return path.slice(slashIndex + 1)
}

export const downloadToDisk = async (diskPath: string, response: Response): Promise<void> => {
  const parentPath = getParentPath(diskPath)
  await RendererWorker.invoke('FileSystem.mkdir', parentPath)
  const blob = await response.blob()
  // @ts-ignore
  await RendererWorker.invoke('FileSystem.writeBlob', diskPath, blob)
}
