import { checkForUpdates } from '../CheckForUpdates/CheckForUpdates.ts'
import { getLatestVersion } from '../GetLatestVersion/GetLatestVersion.ts'
import * as DownloadUpdateToCache from '../DownloadUpdateToCache/DownloadUpdateToCache.ts'

export const commandMap = {
  'Update.getLatestVersion': getLatestVersion,
  'Update.checkForUpdates': checkForUpdates,
  'Update.downloadToCache': DownloadUpdateToCache.downloadUpdateToCache,
}
