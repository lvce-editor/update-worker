import { checkForUpdates } from '../CheckForUpdates/CheckForUpdates.ts'
import * as DownloadUpdateToCache from '../DownloadUpdateToCache/DownloadUpdateToCache.ts'
import { getLatestVersion } from '../GetLatestVersion/GetLatestVersion.ts'

export const commandMap = {
  'Update.checkForUpdates': checkForUpdates,
  'Update.downloadToCache': DownloadUpdateToCache.downloadUpdateToCache,
  'Update.getLatestVersion': getLatestVersion,
}
