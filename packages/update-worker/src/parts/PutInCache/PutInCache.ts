import type { ICache } from '../GetCache/GetCache.ts'

export const putInCache = async (url: string, response: Response, cache: ICache): Promise<void> => {
  await cache.put(url, response)
}
