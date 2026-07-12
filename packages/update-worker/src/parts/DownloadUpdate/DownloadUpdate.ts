export const downloadUpdate = async (updateUrl: string): Promise<Response> => {
  const response = await fetch(updateUrl, {
    priority: 'low',
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response
}
