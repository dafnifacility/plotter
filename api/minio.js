import { backendsPromise, nivsMinioUrl } from '~/api/backends/'
import axios from 'axios'

function replaceNIVSMinioUrl(presignedUrl) {
  if (!nivsMinioUrl) return presignedUrl

  const dafniUrl = 'dafni.rl.ac.uk'
  const dafniIndex = presignedUrl.indexOf(dafniUrl)
  const indexToSlice = dafniIndex + dafniUrl.length
  const presignedUrlMinusHost = presignedUrl.slice(indexToSlice)
  return nivsMinioUrl.concat(presignedUrlMinusHost)
}

export async function uploadState(presignedUrl, state) {
  await backendsPromise
  return await axios.put(
    replaceNIVSMinioUrl(presignedUrl),
    JSON.stringify(state),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
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
