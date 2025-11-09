import { PlatformType } from '@lvce-editor/constants'
import { RendererWorker } from '@lvce-editor/rpc-registry'

export const confirmPrompt = async (message: string): Promise<boolean> => {
  const result = await RendererWorker.invoke('ConfirmPrompt.prompt', message, {
    // @ts-ignore
    platform: PlatformType.Electron,
  })
  return result
}
