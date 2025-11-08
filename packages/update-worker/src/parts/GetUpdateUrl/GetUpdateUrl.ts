export const getUpdateUrl = (repository: string, version: string): string => {
  const fileName = `Lvce-Setup-v${version}-x64.exe`
  const url = `https://github.com/${repository}/releases/download/v${version}/${fileName}`
  return url
}
