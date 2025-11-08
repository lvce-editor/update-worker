import { VError } from '@lvce-editor/verror'

const parseVersionFromUrl = (url: string, repository: string): string => {
  if (!url.includes('releases/tag')) {
    if (url.endsWith('/releases')) {
      throw new Error(`no releases found for ${repository}`)
    }
    throw new Error(`cannot parse release version from url ${url}`)
  }
  const slashIndex = url.lastIndexOf('/')
  const version = url.slice(slashIndex + 1)
  if (version.startsWith('v')) {
    return version.slice(1)
  }
  return version
}

export const getLatestReleaseVersion = async (repository: string): Promise<string> => {
  try {
    const url = `https://github.com/${repository}/releases/latest`
    const finalUrlResponse = await fetch(url, {
      method: 'HEAD',
    })
    const finalUrl = await finalUrlResponse.text()
    const version = parseVersionFromUrl(finalUrl, repository)
    return version
  } catch (error) {
    throw new VError(error, `Failed to get latest release for ${repository}`)
  }
}
