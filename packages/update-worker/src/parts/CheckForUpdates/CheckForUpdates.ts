import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as AutoUpdaterStrings from '../AutoUpdaterStrings/AutoUpdaterStrings.ts'
import { confirmPrompt } from '../ConfirmPrompt/ConfirmPrompt.ts'
import { downloadUpdateToCache } from '../DownloadUpdateToCache/DownloadUpdateToCache.ts'
import { getLatestReleaseVersion } from '../GetLatestReleaseVersion/GetLatestReleaseVersion.ts'
import { installAndRestart } from '../InstallAndRestart/InstallAndRestart.ts'
import { shouldUpdate } from '../ShouldUpdate/ShouldUpdate.ts'

export interface UpdateResult {
  readonly updated: boolean
  readonly error: any
}

export const checkForUpdates = async (updateSetting: string, repository: string): Promise<UpdateResult> => {
  try {
    const info = await getLatestReleaseVersion(repository)
    if (!info || !info.version) {
      return {
        updated: false,
        error: undefined,
      }
    }
    if (!(await shouldUpdate(updateSetting, info.version))) {
      return {
        updated: false,
        error: undefined,
      }
    }
    // @ts-ignore
    await RendererWorker.invoke('Layout.setUpdateState', {
      state: 'downloading',
      progress: 0,
    })
    await downloadUpdateToCache(repository, info.version)
    const messageRestart = AutoUpdaterStrings.promptRestart()
    const shouldRestart = await confirmPrompt(messageRestart)
    if (!shouldRestart) {
      return {
        updated: false,
        error: undefined,
      }
    }
    const downloadPath = '' // TODO get it from cache to disk somehow
    await installAndRestart(downloadPath)
    return {
      updated: true,
      error: undefined,
    }
  } catch (error) {
    console.error(error)
    return {
      updated: false,
      error: undefined,
    }
  }
}
