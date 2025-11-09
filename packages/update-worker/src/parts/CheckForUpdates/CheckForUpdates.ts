import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as AutoUpdaterStrings from '../AutoUpdaterStrings/AutoUpdaterStrings.ts'
import { confirmPrompt } from '../ConfirmPrompt/ConfirmPrompt.ts'
import { downloadToDisk } from '../DownloadToDisk/DownloadToDisk.ts'
import { downloadUpdateToCache } from '../DownloadUpdateToCache/DownloadUpdateToCache.ts'
import { getCache } from '../GetCache/GetCache.ts'
import { getLatestReleaseVersion } from '../GetLatestReleaseVersion/GetLatestReleaseVersion.ts'
import { getUpdateUrl } from '../GetUpdateUrl/GetUpdateUrl.ts'
import { installAndRestart } from '../InstallAndRestart/InstallAndRestart.ts'
import { isCached } from '../IsCached/IsCached.ts'
import { shouldUpdate } from '../ShouldUpdate/ShouldUpdate.ts'

export interface UpdateResult {
  readonly updated: boolean
  readonly error: any
}

export const checkForUpdates = async (updateSetting: string, repository: string): Promise<UpdateResult> => {
  try {
    const bucketName = 'electron-updates'
    const cacheName = 'electron-updates'
    const info = await getLatestReleaseVersion(repository)
    if (!info || !info.version) {
      return {
        updated: false,
        error: undefined,
      }
    }
    const cache = await getCache(bucketName, cacheName)

    if (!(await shouldUpdate(updateSetting, info.version))) {
      return {
        updated: false,
        error: undefined,
      }
    }
    const downloadUrl = getUpdateUrl(repository, info.version)

    // @ts-ignore
    await RendererWorker.invoke('Layout.setUpdateState', {
      state: 'downloading',
      progress: 0,
    })

    if (!(await isCached(downloadUrl, cache))) {
      await downloadUpdateToCache(downloadUrl, cache)
    }
    const messageRestart = AutoUpdaterStrings.promptRestart()
    const shouldRestart = await confirmPrompt(messageRestart)
    if (!shouldRestart) {
      return {
        updated: false,
        error: undefined,
      }
    }
    const response = await cache.match(downloadUrl)
    if (!response) {
      return {
        updated: false,
        error: undefined,
      }
    }
    const diskPath = await downloadToDisk(downloadUrl, response)
    await installAndRestart(diskPath)
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
