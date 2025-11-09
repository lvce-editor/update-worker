import type { ICache } from '../GetCache/GetCache.ts'
import { downloadUpdate } from '../DownloadUpdate/DownloadUpdate.ts'
import { putInCache } from '../PutInCache/PutInCache.ts'

export const downloadUpdateToCache = async (downloadUrl: string, cache: ICache): Promise<void> => {
  const response = await downloadUpdate(downloadUrl)
  await putInCache(downloadUrl, response, cache)
}
