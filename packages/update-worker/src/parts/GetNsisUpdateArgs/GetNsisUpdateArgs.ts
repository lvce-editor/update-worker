export const getNsisUpdateArgs = (): readonly string[] => {
  const args = ['--updated', '/S', '--force-run']
  return args
}
