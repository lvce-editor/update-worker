import { expect, test } from '@jest/globals'
import { PlatformType } from '@lvce-editor/constants'
import { DialogWorker } from '@lvce-editor/rpc-registry'
import { confirmPrompt } from '../src/parts/ConfirmPrompt/ConfirmPrompt.ts'

test('confirms through dialog worker', async () => {
  using mockRpc = DialogWorker.registerMockRpc({
    'ConfirmPrompt.prompt': () => true,
  })

  await expect(confirmPrompt('Install the update?')).resolves.toBe(true)

  expect(mockRpc.invocations).toEqual([['ConfirmPrompt.prompt', 'Install the update?', { platform: PlatformType.Electron }]])
})
