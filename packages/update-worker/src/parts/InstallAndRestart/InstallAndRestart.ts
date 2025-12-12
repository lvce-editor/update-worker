import { VError } from '@lvce-editor/verror'
import * as Exec from '../Exec/Exec.ts'
import * as FirstNodeWorkerEventType from '../FirstNodeWorkerEventType/FirstNodeWorkerEventType.ts'
import { getNsisUpdateArgs } from '../GetNsisUpdateArgs/GetNsisUpdateArgs.ts'

export const installAndRestart = async (downloadPath: string): Promise<void> => {
  try {
    const args = getNsisUpdateArgs()
    const { event, type } = await Exec.exec(downloadPath, args, {
      detached: true,
      stdio: 'inherit',
    })
    if (type === FirstNodeWorkerEventType.Error) {
      throw new Error(`Child process error: ${event}`)
    }
  } catch (error) {
    throw new VError(error, `Failed to install nsis update`)
  }
}
