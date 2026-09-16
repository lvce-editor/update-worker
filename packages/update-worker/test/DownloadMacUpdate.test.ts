import { afterEach, expect, jest, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { downloadMacUpdate } from '../src/parts/DownloadMacUpdate/DownloadMacUpdate.ts'

const bytes = new TextEncoder().encode('verified disk image')
const hash = await crypto.subtle.digest('SHA-256', bytes)
const digest = `sha256:${Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')}`
const assetName = 'lvce-v0.115.15_arm64.dmg'
const url = `https://github.com/lvce-editor/lvce-editor/releases/download/v0.115.15/${assetName}`

afterEach(() => {
  jest.restoreAllMocks()
})

const mockFetch = (assetDigest = digest, status = 200): jest.SpiedFunction<typeof fetch> => {
  return jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(Response.json({ assets: [{ browser_download_url: url, digest: assetDigest, name: assetName, size: bytes.byteLength }] }))
    .mockResolvedValueOnce(new Response(bytes, { status }))
}

test('downloads the architecture-specific DMG, checks its digest and writes it through the filesystem RPC', async () => {
  const fetchMock = mockFetch()
  using rpc = RendererWorker.registerMockRpc({
    'FileSystem.mkdir': () => {},
    'FileSystem.writeBlob': async (_path: string, blob: Blob) => expect(await blob.text()).toBe('verified disk image'),
    'PlatformPaths.getCacheUri': () => 'file:///cache',
  })

  await expect(downloadMacUpdate('0.115.15', 'arm64')).resolves.toBe(`file:///cache/auto-updater/${assetName}`)
  expect(fetchMock).toHaveBeenNthCalledWith(2, url, expect.any(Object))
  expect(rpc.invocations[2][0]).toBe('FileSystem.writeBlob')
})

test('rejects checksum mismatch before writing or installing', async () => {
  mockFetch(`sha256:${'0'.repeat(64)}`)
  using rpc = RendererWorker.registerMockRpc({})
  await expect(downloadMacUpdate('0.115.15', 'arm64')).rejects.toThrow('checksum')
  expect(rpc.invocations).toEqual([])
})

test('reports missing architecture assets instead of downloading another architecture', async () => {
  const fetchMock = mockFetch()
  await expect(downloadMacUpdate('0.115.15', 'x64')).rejects.toThrow('lvce-v0.115.15_x64.dmg')
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('reports download HTTP failures', async () => {
  mockFetch(digest, 404)
  await expect(downloadMacUpdate('0.115.15', 'arm64')).rejects.toThrow('HTTP 404')
})
