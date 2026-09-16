import { afterEach, expect, jest, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { getLatestVersion } from '../src/parts/GetLatestVersion/GetLatestVersion.ts'

afterEach(() => {
  jest.restoreAllMocks()
})

const mockLatestRelease = (): void => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    url: 'https://github.com/lvce-editor/lvce-editor/releases/tag/v0.115.15',
  } as Response)
}

test('an older override discovers the latest release even when the installed version matches it', async () => {
  mockLatestRelease()
  using rpc = RendererWorker.registerMockRpc({
    'Preferences.get': (key: string) => {
      expect(key).toBe('update.emulateCurrentVersion')
      return '0.115.14'
    },
    'Process.getVersion': () => '0.115.15',
  })

  await expect(getLatestVersion('lvce-editor/lvce-editor')).resolves.toEqual({ version: '0.115.15' })
  expect(rpc.invocations).toEqual([['Preferences.get', 'update.emulateCurrentVersion']])
  expect(fetch).toHaveBeenCalledWith('https://github.com/lvce-editor/lvce-editor/releases/latest', { method: 'HEAD' })
})

test.each([undefined, null, '', 123, 'invalid', '0.115', '0.115.14-extra', ' 0.115.14'])(
  'falls back to the installed version for %p',
  async (override) => {
    mockLatestRelease()
    using rpc = RendererWorker.registerMockRpc({
      'Preferences.get': () => override,
      'Process.getVersion': () => '0.115.15',
    })

    await expect(getLatestVersion('lvce-editor/lvce-editor')).resolves.toBeUndefined()
    expect(rpc.invocations).toEqual([['Preferences.get', 'update.emulateCurrentVersion'], ['Process.getVersion']])
  },
)

test('an unset override still detects updates for an older installed version', async () => {
  mockLatestRelease()
  using rpc = RendererWorker.registerMockRpc({
    'Preferences.get': () => undefined,
    'Process.getVersion': () => '0.115.9',
  })

  await expect(getLatestVersion('lvce-editor/lvce-editor')).resolves.toEqual({ version: '0.115.15' })
  expect(rpc.invocations).toContainEqual(['Process.getVersion'])
})

test.each(['0.115.15', '0.116.0'])('does not offer an update when the emulated version is %s', async (override) => {
  mockLatestRelease()
  using rpc = RendererWorker.registerMockRpc({
    'Preferences.get': () => override,
  })

  await expect(getLatestVersion('lvce-editor/lvce-editor')).resolves.toBeUndefined()
  expect(rpc.invocations).toHaveLength(1)
})
