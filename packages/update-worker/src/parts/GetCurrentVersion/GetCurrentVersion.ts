import { RendererWorker } from '@lvce-editor/rpc-registry'

export const getCurrentVersion = async (): Promise<string> => {
  // @ts-ignore
  const override: unknown = await RendererWorker.invoke('Preferences.get', 'update.emulateCurrentVersion')
  if (typeof override === 'string' && /^\d+\.\d+\.\d+$/.test(override)) {
    return override
  }
  // @ts-ignore
  return RendererWorker.invoke('Process.getVersion')
}
