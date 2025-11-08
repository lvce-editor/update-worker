import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as AutoUpdaterStrings from '../AutoUpdaterStrings/AutoUpdaterStrings.ts'
import { downloadUpdateToCache } from '../DownloadUpdateToCache/DownloadUpdateToCache.ts'
import { getLatestReleaseVersion } from '../GetLatestReleaseVersion/GetLatestReleaseVersion.ts'
import { installAndRestart } from '../InstallAndRestart/InstallAndRestart.ts'
import { shouldUpdate } from '../ShouldUpdate/ShouldUpdate.ts'

export const checkForUpdates = async (updateSetting: string, repository: string): Promise<void> => {
  const info = await getLatestReleaseVersion(repository)
  if (!info || !info.version) {
    return
  }
  if (!(await shouldUpdate(updateSetting, info.version))) {
    return
  }
  // @ts-ignore
  await RendererWorker.invoke('Layout.setUpdateState', {
    state: 'downloading',
    progress: 0,
  })
  await downloadUpdateToCache(repository, info.version)
  const downloadPath = '' // TODO get it from cache to disk somehow
  const messageRestart = AutoUpdaterStrings.promptRestart()
  const shouldRestart = await RendererWorker.invoke('ConfirmPrompt.prompt', messageRestart, {
    confirmMessage: '',
    title: '',
  })
  if (!shouldRestart) {
    return
  }
  await installAndRestart(downloadPath)
}
