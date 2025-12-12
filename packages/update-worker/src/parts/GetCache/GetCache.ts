/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export interface ICache {
  readonly match: (request: RequestInfo | URL, options?: CacheQueryOptions) => Promise<Response | undefined>
  readonly put: (request: RequestInfo | URL, response: Response) => Promise<void>
}

const cachedCaches: Record<string, Promise<ICache>> = Object.create(null)

const noopCache: ICache = {
  async match() {
    return undefined
  },
  async put() {},
}

const supportsStorageBuckets = (): boolean => {
  // @ts-ignore
  return Boolean(navigator.storageBuckets)
}

const getCacheInternal = async (bucketName: string, cacheName: string): Promise<ICache> => {
  if (!supportsStorageBuckets()) {
    return noopCache
  }
  const twoWeeks = 14 * 24 * 60 * 60 * 1000
  // @ts-ignore
  const bucket = await navigator.storageBuckets.open(bucketName, {
    expires: Date.now() + twoWeeks,
    quota: 1000 * 1024 * 1024, // 1 GB
  })
  const cache = (await bucket.caches.open(cacheName)) as Cache
  return cache
}

export const getCache = (bucketName: string, cacheName: string): Promise<ICache> => {
  if (!(cacheName in cachedCaches)) {
    cachedCaches[cacheName] = getCacheInternal(bucketName, cacheName)
  }
  return cachedCaches[cacheName]
}
