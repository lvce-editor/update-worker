export interface ExecOptions {
  readonly stdio: 'inherit'
  readonly detached: boolean
}

export interface ExecResult {
  readonly type: number
  readonly error?: string
}

export const exec = async (path: string, args: readonly string[], options: ExecOptions): Promise<ExecResult> => {
  // TODO
  return {
    type: 0,
  }
}
