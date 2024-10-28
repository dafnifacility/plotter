import axios from 'axios'

export async function uploadState(presignedUrl, state) {
  return await axios.put(presignedUrl, JSON.stringify(state), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function downloadState(presignedUrl) {
  const response = await axios.get(presignedUrl, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

export async function downloadFileFromMinio(presignedUrl) {
  const response = await axios.get(presignedUrl)
  return response.data
}

export default {
  uploadState,
  downloadState,
}
