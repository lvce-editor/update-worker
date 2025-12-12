import { checkForUpdates } from '../CheckForUpdates/CheckForUpdates.ts'
import * as DownloadUpdateToCache from '../DownloadUpdateToCache/DownloadUpdateToCache.ts'

export const commandMap = {
  'Update.checkForUpdates': checkForUpdates,
  'Update.downloadToCache': DownloadUpdateToCache.downloadUpdateToCache,
}
