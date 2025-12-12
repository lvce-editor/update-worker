import { RendererWorker } from '@lvce-editor/rpc-registry'

export interface ExecOptions {
  readonly detached: boolean
  readonly stdio: 'inherit'
}

export interface ExecResult {
  readonly event: any
  readonly type: number
}

export const exec = async (path: string, args: readonly string[], options: ExecOptions): Promise<ExecResult> => {
  // @ts-ignore
  await RendererWorker.invoke('Exec.exec', path, args, options)
  // TODO
  return {
    event: {},
    type: 0,
  }
}
