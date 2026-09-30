import type { Rpc } from '@lvce-editor/rpc'
import { afterEach, expect, jest, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as CacheWorker from '../src/parts/CacheWorker/CacheWorker.ts'
import { downloadToDisk } from '../src/parts/DownloadToDisk/DownloadToDisk.ts'
import { getCache } from '../src/parts/GetCache/GetCache.ts'

afterEach(() => {
  jest.restoreAllMocks()
  // @ts-ignore
  delete navigator.storageBuckets
})

test('cache worker stores and restores binary update responses in the configured bucket', async () => {
  Object.defineProperty(navigator, 'storageBuckets', { configurable: true, value: {} })
  const bytes = Uint8Array.of(0, 255, 128, 65)
  const invocations: Array<readonly unknown[]> = []
  CacheWorker.set({
    async invoke(command: string, ...args: readonly unknown[]): Promise<unknown> {
      invocations.push([command, ...args])
      if (command === 'Cache.getCacheStorageItem') {
        return {
          body: bytes.buffer,
          headers: { 'content-type': 'application/octet-stream', 'x-update': 'candidate' },
          status: 200,
          statusText: 'OK',
        }
      }
      return { success: true }
    },
  } as unknown as Rpc)

  const cache = await getCache('update-bucket-test', 'update-cache-test')
  const response = new Response(bytes, {
    headers: { 'content-type': 'application/octet-stream', 'x-update': 'candidate' },
  })
  await cache.put(new URL('https://example.com/update.bin'), response)
  const cached = await cache.match('https://example.com/update.bin')

  expect(cached).toBeInstanceOf(Response)
  const cachedForDisk = cached!.clone()
  expect([...new Uint8Array(await cached!.arrayBuffer())]).toEqual([...bytes])
  expect(cached!.headers.get('x-update')).toBe('candidate')
  using renderer = RendererWorker.registerMockRpc({
    'FileSystem.mkdir': () => undefined,
    'FileSystem.writeBlob': () => undefined,
  })
  await downloadToDisk('/updates/update.bin', cachedForDisk)
  expect(renderer.invocations[1][0]).toBe('FileSystem.writeBlob')
  expect(renderer.invocations[1][1]).toBe('/updates/update.bin')
  expect([...new Uint8Array(await (renderer.invocations[1][2] as Blob).arrayBuffer())]).toEqual([...bytes])
  expect(invocations.map(([command, ...args]) => [command, ...args.slice(0, -1)])).toEqual([
    [
      'Cache.setCacheStorageItem',
      'https://example.com/update.bin',
      bytes.buffer,
      'update-cache-test',
      { 'content-type': 'application/octet-stream', 'x-update': 'candidate' },
      'update-bucket-test',
    ],
    ['Cache.getCacheStorageItem', 'https://example.com/update.bin', 'update-cache-test', 'update-bucket-test'],
  ])
  expect(invocations[0][6]).toEqual({
    expires: expect.any(Number),
    quota: 1000 * 1024 * 1024,
  })
})

test('cache worker write errors remain visible to PutInCache handling', async () => {
  Object.defineProperty(navigator, 'storageBuckets', { configurable: true, value: {} })
  CacheWorker.set({
    async invoke(): Promise<unknown> {
      return { errorMessage: 'quota exceeded', success: false }
    },
  } as unknown as Rpc)
  const cache = await getCache('update-bucket-error-test', 'update-cache-error-test')

  await expect(cache.put('/update.bin', new Response('installer'))).rejects.toThrow('quota exceeded')
})

test('unsupported storage buckets retain the no-op cache behavior', async () => {
  // @ts-ignore
  delete navigator.storageBuckets
  const cache = await getCache('update-bucket-unsupported-test', 'update-cache-unsupported-test')

  await expect(cache.match('/update.bin')).resolves.toBeUndefined()
  await expect(cache.put('/update.bin', new Response('installer'))).resolves.toBeUndefined()
})
