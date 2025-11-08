import { checkForUpdates } from '../CheckForUpdates/CheckForUpdates.ts'
import * as DownloadUpdateToCache from '../DownloadUpdateToCache/DownloadUpdateToCache.ts'

export const commandMap = {
  'Update.downloadToCache': DownloadUpdateToCache.downloadUpdateToCache,
  'Update.checkForUpdates': checkForUpdates,
}
