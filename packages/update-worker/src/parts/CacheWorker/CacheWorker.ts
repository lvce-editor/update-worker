import { getCacheWorkerUrl } from '@lvce-editor/cache-worker'
import { ModuleWorkerRpcParent, type Rpc } from '@lvce-editor/rpc'

const state: { rpc?: Rpc } = {}

export const set = (cacheWorkerRpc: Rpc): void => {
  state.rpc = cacheWorkerRpc
}

export const invoke = async (command: string, ...args: readonly unknown[]): Promise<unknown> => {
  if (!state.rpc) {
    state.rpc = await ModuleWorkerRpcParent.create({
      commandMap: {},
      url: getCacheWorkerUrl().href,
    })
  }
  return state.rpc.invoke(command, ...args)
}
