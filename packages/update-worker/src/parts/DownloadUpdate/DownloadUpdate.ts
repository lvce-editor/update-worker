export const downloadUpdate = async (updateUrl: string): Promise<Response> => {
  const response = await fetch(updateUrl, {
    priority: 'low',
    redirect: 'follow',
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response
}
