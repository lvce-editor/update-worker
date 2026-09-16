import { afterEach, expect, jest, test } from '@jest/globals'
import { DialogWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import { doCheckForUpdates } from '../src/parts/DoCheckForUpdates/DoCheckForUpdates.ts'

afterEach(() => {
  jest.restoreAllMocks()
  // @ts-ignore
  delete navigator.onLine
})

test('Windows keeps the existing update confirmation flow', async () => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({ url: 'https://github.com/lvce-editor/lvce-editor/releases/tag/v0.115.15' } as Response)
  using renderer = RendererWorker.registerMockRpc({
    'AutoUpdater.getPlatform': () => 'win32',
    'Preferences.get': () => '0.115.14',
  })
  using dialog = DialogWorker.registerMockRpc({ 'ConfirmPrompt.prompt': () => false })

  await expect(doCheckForUpdates('', 'lvce-editor/lvce-editor', 'Lvce-Setup-v${version}-x64.exe', 'test', 'test')).resolves.toEqual({
    error: undefined,
    updated: false,
  })
  expect(dialog.invocations).toHaveLength(1)
  expect(dialog.invocations[0][1]).toContain('0.115.15')
  expect(renderer.invocations.some(([command]) => String(command).includes('MacUpdate'))).toBe(false)
})

test('reports a failed update check to the host', async () => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
  using renderer = RendererWorker.registerMockRpc({ 'Preferences.get': () => '0.115.14' })

  const result = await doCheckForUpdates('', 'lvce-editor/lvce-editor', '', 'test', 'test')
  expect(result.updated).toBe(false)
  expect(result.error).toContain('offline')
  expect(renderer.invocations).toHaveLength(1)
})
