export const getNSISUpdateArgs = (): readonly string[] => {
  const args = ['--updated', '/S', '--force-run']
  return args
}
