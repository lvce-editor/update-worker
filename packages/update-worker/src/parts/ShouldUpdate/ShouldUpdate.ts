import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as AutoUpdaterStrings from '../AutoUpdaterStrings/AutoUpdaterStrings.ts'

export const shouldUpdate = async (updateSetting: string, version: string): Promise<boolean> => {
  if (updateSetting && updateSetting !== 'none') {
    return true
  }
  const message = AutoUpdaterStrings.promptMessage(version)
  const shouldUpdate = await RendererWorker.invoke('ConfirmPrompt.prompt', message, {
    confirmMessage: '',
    title: '',
  })
  return shouldUpdate
}
