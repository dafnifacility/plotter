import axios from 'axios'
import { backendsPromise } from '~/api/backends/'

export async function uploadState(presignedUrl, state) {
  await backendsPromise
  return fetch(presignedUrl, {
    method: 'PUT',
    body: JSON.stringify(state),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => {
    if (!response.ok) {
      throw response.statusText
    }
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

export default {
  uploadState,
  downloadState,
}
