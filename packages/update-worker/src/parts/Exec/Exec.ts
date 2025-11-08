export interface ExecOptions {
  readonly stdio: 'inherit'
  readonly detached: boolean
}

export interface ExecResult {
  readonly type: number
  readonly event: any
}

export const exec = async (path: string, args: readonly string[], options: ExecOptions): Promise<ExecResult> => {
  // TODO
  return {
    type: 0,
    event: {},
  }
}
