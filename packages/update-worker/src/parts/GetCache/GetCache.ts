/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

import * as CacheWorker from '../CacheWorker/CacheWorker.ts'

export interface ICache {
  readonly match: (request: RequestInfo | URL, options?: CacheQueryOptions) => Promise<Response | undefined>
  readonly put: (request: RequestInfo | URL, response: Response) => Promise<void>
}

interface CacheStorageItem {
  readonly body: ArrayBuffer
  readonly headers: Readonly<Record<string, string>>
  readonly status: number
  readonly statusText: string
}

interface CacheStorageWriteResult {
  readonly errorMessage?: string
  readonly success: boolean
}

interface StorageBucketOptions {
  readonly expires: number
  readonly quota: number
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

const getRequestUrl = (request: RequestInfo | URL): string => {
  if (request instanceof Request) {
    return request.url
  }
  return request.toString()
}

const getCacheInternal = async (bucketName: string, cacheName: string): Promise<ICache> => {
  if (!supportsStorageBuckets()) {
    return noopCache
  }
  const bucketOptions: StorageBucketOptions = {
    expires: Date.now() + 14 * 24 * 60 * 60 * 1000,
    quota: 1000 * 1024 * 1024,
  }
  return {
    async match(request): Promise<Response | undefined> {
      const cached = (await CacheWorker.invoke(
        'Cache.getCacheStorageItem',
        getRequestUrl(request),
        cacheName,
        bucketName,
        bucketOptions,
      )) as CacheStorageItem | null
      if (!cached) {
        return undefined
      }
      return new Response(cached.body, {
        headers: cached.headers,
        status: cached.status,
        statusText: cached.statusText,
      })
    },
    async put(request, response): Promise<void> {
      const body = await response.arrayBuffer()
      const headers = Object.fromEntries(response.headers.entries())
      const result = (await CacheWorker.invoke(
        'Cache.setCacheStorageItem',
        getRequestUrl(request),
        body,
        cacheName,
        headers,
        bucketName,
        bucketOptions,
      )) as CacheStorageWriteResult
      if (!result.success) {
        throw new Error(result.errorMessage || 'Failed to write update response to cache')
      }
    },
  }
}

export const getCache = (bucketName: string, cacheName: string): Promise<ICache> => {
  const cacheKey = `${bucketName}\u{0}${cacheName}`
  if (!(cacheKey in cachedCaches)) {
    cachedCaches[cacheKey] = getCacheInternal(bucketName, cacheName)
  }
  return cachedCaches[cacheKey]
}
