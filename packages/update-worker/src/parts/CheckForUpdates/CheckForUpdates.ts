import type { UpdateResult } from '../DoCheckForUpdates/DoCheckForUpdates.ts'
import { doCheckForUpdates } from '../DoCheckForUpdates/DoCheckForUpdates.ts'
import { requestLock } from '../RequestLock/RequestLock.ts'

export const checkForUpdates = async (updateSetting: string, repository: string): Promise<UpdateResult> => {
  const lockName = 'electron-updates'
  const bucketName = 'electron-updates'
  const cacheName = 'electron-updates'
  const fileNameTemplate = `Lvce-Setup-v\${version}-x64.exe`

  const result = await requestLock(lockName, async (lock) => {
    if (!lock) {
      return {
        updated: false,
        error: undefined,
      }
    }
    const result = await doCheckForUpdates(updateSetting, repository, fileNameTemplate, bucketName, cacheName)
    return result
  })
  return result
}
