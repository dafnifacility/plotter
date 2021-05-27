import axios from 'axios'
import { backendsPromise } from '~/api/backends/'

export async function uploadState(presignedUrl, state) {
  await backendsPromise
  return await axios.put(presignedUrl, JSON.stringify(state), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function downloadState(presignedUrl) {
  await backendsPromise
  const response = await axios.get(presignedUrl, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

export async function downloadFile(presignedUrl) {
  await backendsPromise
  const response = await axios.get(presignedUrl)
  return response.data
}

export default {
  uploadState,
  downloadState,
}
