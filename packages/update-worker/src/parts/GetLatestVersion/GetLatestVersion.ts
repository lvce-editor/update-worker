import type { ReleaseInfo } from '../GetLatestReleaseVersion/GetLatestReleaseVersion.ts'
import { isGreater } from '../CompareVersion/CompareVersion.ts'
import { getCurrentVersion } from '../GetCurrentVersion/GetCurrentVersion.ts'
import { getLatestReleaseVersion } from '../GetLatestReleaseVersion/GetLatestReleaseVersion.ts'

export const getLatestVersion = async (repository: string): Promise<ReleaseInfo | undefined> => {
  const currentVersion = await getCurrentVersion()
  const release = await getLatestReleaseVersion(repository)
  if (isGreater(release.version, currentVersion)) {
    return release
  }
  return undefined
}
