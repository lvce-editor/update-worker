export const requestLock = async <T>(lockName: string, callback: (lock: Lock | null) => Promise<T>): Promise<T> => {
  const result = await navigator.locks.request(
    lockName,
    {
      ifAvailable: true,
    },
    callback,
  )
  return result
}
