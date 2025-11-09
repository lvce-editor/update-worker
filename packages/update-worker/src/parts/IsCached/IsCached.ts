import type { ICache } from '../GetCache/GetCache.ts'

export const isCached = async (url: string, cache: ICache): Promise<boolean> => {
  const match = await cache.match(url)
  if (match) {
    return true
  }
  return false
}
