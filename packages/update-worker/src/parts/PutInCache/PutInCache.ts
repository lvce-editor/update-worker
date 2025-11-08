import { getCache } from '../GetCache/GetCache.ts'

export const putInCache = async (url: string, response: Response): Promise<void> => {
  const bucketName = 'electron-updates'
  const cacheName = 'electron-updates'
  const cache = await getCache(bucketName, cacheName)
  await cache.put(url, response)
}
