import * as UpdateStateType from '../UpdateStateType/UpdateStateType.ts'

export const state = {
  updateState: UpdateStateType.Uninitialized,
}

export const get = (): number => {
  return state.updateState
}

export const set = (value: number): void => {
  state.updateState = value
}
