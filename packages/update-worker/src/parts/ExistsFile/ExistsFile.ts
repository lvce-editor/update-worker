import { RendererWorker } from '@lvce-editor/rpc-registry'

export const existsFile = (uri: string): Promise<boolean> => {
  // @ts-ignore
  return RendererWorker.invoke('FileSystem.exists', uri)
}
