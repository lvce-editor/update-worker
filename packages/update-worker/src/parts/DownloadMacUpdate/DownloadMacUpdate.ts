import { downloadToDisk } from '../DownloadToDisk/DownloadToDisk.ts'
import { getDiskPath } from '../GetDiskPath/GetDiskPath.ts'

interface ReleaseAsset {
  readonly browser_download_url: string
  readonly digest: string
  readonly name: string
  readonly size: number
}

export const downloadMacUpdate = async (version: string, arch: string): Promise<string> => {
  if (!/^\d+\.\d+\.\d+$/.test(version) || !['arm64', 'x64'].includes(arch)) {
    throw new Error('Invalid macOS update version or architecture')
  }
  const repository = 'lvce-editor/lvce-editor'
  const assetName = `lvce-v${version}_${arch}.dmg`
  const url = `https://github.com/${repository}/releases/download/v${version}/${assetName}`
  const metadata = await fetch(`https://api.github.com/repos/${repository}/releases/tags/v${version}`, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!metadata.ok) {
    throw new Error(`Failed to read release metadata: HTTP ${metadata.status}`)
  }
  const release = (await metadata.json()) as { readonly assets?: readonly ReleaseAsset[] }
  const asset = release.assets?.find((item) => item.name === assetName)
  const maxSize = 512 * 1024 * 1024
  if (!asset || asset.browser_download_url !== url || !/^sha256:[a-f0-9]{64}$/.test(asset.digest) || !(asset.size > 0 && asset.size <= maxSize)) {
    throw new Error(`Release is missing a valid ${assetName} asset or SHA-256 digest`)
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(600_000) })
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download update: HTTP ${response.status}`)
  }
  const reader = response.body.getReader()
  const chunks: ArrayBuffer[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      size += value.byteLength
      if (size > asset.size) {
        throw new Error('Update download exceeds the expected size')
      }
      chunks.push(new Uint8Array(value).buffer)
    }
  } finally {
    await reader.cancel()
  }
  const blob = new Blob(chunks)
  const hash = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  const digest = `sha256:${Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('')}`
  if (size !== asset.size || digest !== asset.digest) {
    throw new Error('Update download checksum or size does not match')
  }
  const diskPath = await getDiskPath(url)
  await downloadToDisk(diskPath, new Response(blob))
  return diskPath
}
