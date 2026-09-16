import { PlatformType } from '@lvce-editor/constants'
import { DialogWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import type { UpdateResult } from '../DoCheckForUpdates/DoCheckForUpdates.ts'
import { downloadMacUpdate } from '../DownloadMacUpdate/DownloadMacUpdate.ts'

export const installMacUpdate = async (version: string, download: typeof downloadMacUpdate = downloadMacUpdate): Promise<UpdateResult> => {
  const install = await DialogWorker.invoke('ConfirmPrompt.prompt', `Version ${version} is available. Install this update?`, {
    confirmMessage: 'Install Update',
    platform: PlatformType.Electron,
  })
  if (!install) {
    return { error: undefined, updated: false }
  }
  // @ts-ignore
  await RendererWorker.invoke('Notification.create', 'info', `Preparing update ${version}...`)
  // @ts-ignore
  const arch = await RendererWorker.invoke('Process.getArch')
  const diskPath = await download(version, arch)
  // @ts-ignore
  await RendererWorker.invoke('AutoUpdater.stageMacUpdate', diskPath, version)
  const restart = await DialogWorker.invoke('ConfirmPrompt.prompt', `Update ${version} is ready. Restart to finish installing?`, {
    cancelMessage: 'Later',
    confirmMessage: 'Restart',
    platform: PlatformType.Electron,
  })
  if (!restart) {
    return { error: undefined, updated: false }
  }
  // @ts-ignore
  await RendererWorker.invoke('AutoUpdater.restartMacUpdate')
  return { error: undefined, updated: true }
}
