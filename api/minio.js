import axios from 'axios'
import { nidMinioUrl } from '~/api/backends/'

export function replaceMinioUrl(presignedUrl, replacementUrl) {
  if (!replacementUrl) return presignedUrl

  const dafniUrl = 'dafni.rl.ac.uk'
  const dafniIndex = presignedUrl.indexOf(dafniUrl)
  const indexToSlice = dafniIndex + dafniUrl.length
  const presignedUrlMinusHost = presignedUrl.slice(indexToSlice)
  return replacementUrl.concat(presignedUrlMinusHost)
}

export async function uploadState(presignedUrl, state) {
  return await axios.put(
    replaceMinioUrl(presignedUrl, nidMinioUrl),
    JSON.stringify(state),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export async function downloadState(presignedUrl) {
  const response = await axios.get(replaceMinioUrl(presignedUrl, nidMinioUrl), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

export async function downloadFileFromMinio(presignedUrl) {
  const response = await axios.get(replaceMinioUrl(presignedUrl, nidMinioUrl))
  return response.data
}

export default {
  replaceMinioUrl,
  uploadState,
  downloadState,
}
