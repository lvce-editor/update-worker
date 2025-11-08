import { downloadUpdate } from '../DownloadUpdate/DownloadUpdate.ts'
import { getUpdateUrl } from '../GetUpdateUrl/GetUpdateUrl.ts'
import { putInCache } from '../PutInCache/PutInCache.ts'

export const downloadUpdateToCache = async (repository: string, version: string): Promise<void> => {
  const downloadUrl = getUpdateUrl(repository, version)
  const response = await downloadUpdate(downloadUrl)
  await putInCache(downloadUrl, response)
}
