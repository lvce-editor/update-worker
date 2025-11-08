import * as AutoUpdaterStrings from '../AutoUpdaterStrings/AutoUpdaterStrings.ts'
import { confirmPrompt } from '../ConfirmPrompt/ConfirmPrompt.ts'

export const shouldUpdate = async (updateSetting: string, version: string): Promise<boolean> => {
  if (updateSetting && updateSetting !== 'none') {
    return true
  }
  const message = AutoUpdaterStrings.promptMessage(version)

  const shouldUpdate = await confirmPrompt(message)
  return shouldUpdate
}
