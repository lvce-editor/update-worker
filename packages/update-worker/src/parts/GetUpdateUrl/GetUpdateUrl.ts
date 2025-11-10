export const getUpdateUrl = (repository: string, fileNameTemplate: string, version: string): string => {
  const fileName = fileNameTemplate.replace('${version}', version)
  const url = `https://github.com/${repository}/releases/download/v${version}/${fileName}`
  return url
}
