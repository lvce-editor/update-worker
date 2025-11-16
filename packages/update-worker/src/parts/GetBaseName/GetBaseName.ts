export const getBaseName = (downloadUrl: string): string => {
  const lastSlashIndex = downloadUrl.lastIndexOf('/')
  return downloadUrl.slice(lastSlashIndex + 1)
}
