export const putInCache = async (url: string, response: Response): Promise<void> => {
  const cache = await caches.open('electron-updates')
  await cache.put(url, response)
}
