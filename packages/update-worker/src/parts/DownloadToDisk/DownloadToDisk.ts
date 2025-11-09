import { RendererWorker } from '@lvce-editor/rpc-registry'

export const downloadToDisk = async (diskPath: string, response: Response): Promise<void> => {
  // @ts-ignore
  const blob = await response.blob()
  // @ts-ignore
  await RendererWorker.invoke('FileSystem.writeBlob', diskPath, blob)
}
