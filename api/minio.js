import { backendsPromise, nidMinioUrl, nivsMinioUrl } from '~/api/backends/'
import axios from 'axios'

export function replaceMinioUrl(presignedUrl, replacementUrl) {
  if (!replacementUrl) return presignedUrl

  const dafniUrl = 'dafni.rl.ac.uk'
  const dafniIndex = presignedUrl.indexOf(dafniUrl)
  const indexToSlice = dafniIndex + dafniUrl.length
  const presignedUrlMinusHost = presignedUrl.slice(indexToSlice)
  return replacementUrl.concat(presignedUrlMinusHost)
}

export async function uploadState(presignedUrl, state) {
  await backendsPromise
  return await axios.put(
    replaceMinioUrl(presignedUrl, nivsMinioUrl),
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
  const response = await axios.get(
    replaceMinioUrl(presignedUrl, nivsMinioUrl),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  return response.data
}

export async function downloadFile(presignedUrl) {
  await backendsPromise
  const response = await axios.get(replaceMinioUrl(presignedUrl, nidMinioUrl))
  return response.data
}

export default {
  replaceMinioUrl,
  uploadState,
  downloadState,
}
