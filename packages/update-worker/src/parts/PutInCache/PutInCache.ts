import type { ICache } from '../GetCache/GetCache.ts'

export const isLowDiskSpaceError = (error: unknown): boolean => {
  return error instanceof DOMException && error.name === 'NetworkError'
}

export const putInCache = async (url: string, response: Response, cache: ICache): Promise<void> => {
  try {
    await cache.put(url, response)
  } catch (error) {
    // Gracefully handle cache errors (e.g., low disk space)
    // Don't block the update process if caching fails
    if (isLowDiskSpaceError(error)) {
      // Silently ignore network errors when putting to cache
      // This can happen when disk space is low
      return
    }
    // For other errors, also ignore to not block the update process
    // but log them for debugging purposes
    console.warn('Failed to put response in cache:', error)
  }
}
