import { beforeEach, expect, jest, test } from '@jest/globals'
import { DialogWorker, RendererWorker } from '@lvce-editor/rpc-registry'

const downloadMacUpdate = jest.fn<(version: string, arch: string, onProgress?: (receivedBytes: number, totalBytes?: number) => void) => Promise<string>>()
import { installMacUpdate } from '../src/parts/InstallMacUpdate/InstallMacUpdate.ts'

beforeEach(() => {
  downloadMacUpdate.mockReset()
})

test('downloads and stages before offering restart', async () => {
  const events: string[] = []
  downloadMacUpdate.mockImplementation(async () => {
    events.push('download')
    return 'file:///cache/update.dmg'
  })
  using renderer = RendererWorker.registerMockRpc({
    'AutoUpdater.restartMacUpdate': () => {
      events.push('restart')
    },
    'AutoUpdater.stageMacUpdate': () => {
      events.push('stage')
    },
    'Notification.create': () => {},
    'Process.getArch': () => 'arm64',
    'Preferences.get': () => true,
    'Layout.setUpdateProgress': () => {},
  })
  using dialog = DialogWorker.registerMockRpc({
    'ConfirmPrompt.prompt': (_message: string, options: { readonly confirmMessage: string }) => {
      events.push(options.confirmMessage)
      return true
    },
  })
  await expect(installMacUpdate('0.115.15', downloadMacUpdate)).resolves.toEqual({ error: undefined, updated: true })
  expect(events).toEqual(['Install Update', 'download', 'stage', 'Restart', 'restart'])
  expect(downloadMacUpdate).toHaveBeenCalledWith('0.115.15', 'arm64', expect.any(Function))
  expect(renderer.invocations).toContainEqual(['AutoUpdater.stageMacUpdate', 'file:///cache/update.dmg', '0.115.15'])
  expect(dialog.invocations).toHaveLength(2)
})

test('cancelling installation does not download or invoke the native helper', async () => {
  using renderer = RendererWorker.registerMockRpc({})
  using dialog = DialogWorker.registerMockRpc({ 'ConfirmPrompt.prompt': () => false })
  await expect(installMacUpdate('0.115.15', downloadMacUpdate)).resolves.toEqual({ error: undefined, updated: false })
  expect(downloadMacUpdate).not.toHaveBeenCalled()
  expect(renderer.invocations).toEqual([])
  expect(dialog.invocations).toHaveLength(1)
})

test('disabling update progress does not interrupt the download', async () => {
  downloadMacUpdate.mockResolvedValue('file:///cache/update.dmg')
  using renderer = RendererWorker.registerMockRpc({
    'AutoUpdater.stageMacUpdate': () => {},
    'Notification.create': () => {},
    'Preferences.get': () => false,
    'Process.getArch': () => 'arm64',
  })
  using dialog = DialogWorker.registerMockRpc({
    'ConfirmPrompt.prompt': (_message: string, options: { readonly confirmMessage: string }) => options.confirmMessage === 'Install Update',
  })
  await expect(installMacUpdate('0.115.15', downloadMacUpdate)).resolves.toEqual({ error: undefined, updated: false })
  expect(downloadMacUpdate).toHaveBeenCalled()
  expect(dialog.invocations).toHaveLength(2)
  expect(renderer.invocations.some(([command]) => command === 'Layout.setUpdateProgress')).toBe(false)
})

test('reports the measured download fraction and removes the item when downloading fails', async () => {
  downloadMacUpdate.mockImplementation(async (_version, _arch, onProgress) => {
    onProgress?.(9, 10)
    throw new Error('download failed')
  })
  using renderer = RendererWorker.registerMockRpc({
    'Notification.create': () => {},
    'Preferences.get': () => true,
    'Process.getArch': () => 'arm64',
    'Layout.setUpdateProgress': () => {},
  })
  using dialog = DialogWorker.registerMockRpc({ 'ConfirmPrompt.prompt': () => true })
  await expect(installMacUpdate('0.115.15', downloadMacUpdate)).rejects.toThrow('download failed')
  expect(dialog.invocations).toHaveLength(1)
  expect(renderer.invocations).toContainEqual(['Layout.setUpdateProgress', 0.9])
  expect(renderer.invocations.at(-1)).toEqual(['Layout.setUpdateProgress', null])
})

test('a failed native install does not offer restart', async () => {
  downloadMacUpdate.mockResolvedValue('file:///cache/update.dmg')
  using renderer = RendererWorker.registerMockRpc({
    'AutoUpdater.stageMacUpdate': () => {
      throw new Error('invalid bundle')
    },
    'Notification.create': () => {},
    'Process.getArch': () => 'arm64',
    'Preferences.get': () => true,
    'Layout.setUpdateProgress': () => {},
  })
  using dialog = DialogWorker.registerMockRpc({ 'ConfirmPrompt.prompt': () => true })
  await expect(installMacUpdate('0.115.15', downloadMacUpdate)).rejects.toThrow('invalid bundle')
  expect(dialog.invocations).toHaveLength(1)
  expect(renderer.invocations.some(([command]) => command === 'AutoUpdater.restartMacUpdate')).toBe(false)
})

test('Later keeps the staged update without restarting', async () => {
  downloadMacUpdate.mockResolvedValue('file:///cache/update.dmg')
  using renderer = RendererWorker.registerMockRpc({
    'AutoUpdater.stageMacUpdate': () => {},
    'Notification.create': () => {},
    'Preferences.get': () => true,
    'Layout.setUpdateProgress': () => {},
    'Process.getArch': () => 'arm64',
  })
  using dialog = DialogWorker.registerMockRpc({
    'ConfirmPrompt.prompt': (_message: string, options: { readonly confirmMessage: string }) => options.confirmMessage === 'Install Update',
  })
  await expect(installMacUpdate('0.115.15', downloadMacUpdate)).resolves.toEqual({ error: undefined, updated: false })
  expect(dialog.invocations).toHaveLength(2)
  expect(renderer.invocations.some(([command]) => command === 'AutoUpdater.restartMacUpdate')).toBe(false)
})
