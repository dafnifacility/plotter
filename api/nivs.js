import {
  backendsPromise,
  instanceID,
  visualisationApiUrl,
} from '~/api/backends/'
import axios from 'axios'

const stateFileName = 'state.json'
const builderId = 'a734e3e7-ca10-41f2-9638-a19710d6430d'

export async function setupSyncStore() {
  return await Promise.all([getPresignedURLforGET(), getPresignedURLforPUT()])
}

export async function getInstance() {
  await backendsPromise
  return axios.get(`${visualisationApiUrl}/instances/${instanceID}`)
}

function getStateFileUrl(listOfFiles) {
  const correctFile = listOfFiles.find(e => e.file_name === stateFileName)
  if (correctFile) {
    return correctFile.presigned_url
  }
  return null
}

export async function getPresignedURLforGET() {
  await backendsPromise
  const response = await axios.get(
    `${visualisationApiUrl}/instances/${instanceId}/state-sync`
  )
  return getStateFileUrl(response.data)
}

export async function getPresignedURLforPUT() {
  await backendsPromise
  const response = await axios.post(
    `${visualisationApiUrl}/instances/${instanceId}/state-sync`,
    {
      files: [stateFileName],
    }
  )
  return getStateFileUrl(response.data)
}

export async function downloadPlot(plotId) {
  await backendsPromise
  const response = await axios.get(`${visualisationApiUrl}/plots/${plotId}`)
  const presignedUrl = response.data.presigned_urls[0].presigned_url
  const getResponse = await axios.get(presignedUrl, {
    headers: {
      'Content-Type': 'image/png',
    },
  })
  return getResponse.data
}

export async function uploadPlot(plotTitle, plotDescription, filename, file) {
  await backendsPromise
  let plotId = null
  const postResponse = await axios.post(`${visualisationApiUrl}/plots`, {
    title: plotTitle,
    description: plotDescription,
    files: [filename],
    visualisation_instance: instanceId,
  })
  const presignedUrl = postResponse.data.presigned_urls[0].presigned_url
  plotId = postResponse.data.id
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': 'image/png',
    },
  })
  await axios.patch(`${visualisationApiUrl}/plots/${plotId}`, {
    data_committed: true,
  })
  return plotId
}

export async function downloadTemplate(templateId) {
  await backendsPromise
  const response = await axios.get(
    `${visualisationApiUrl}/templates/${templateId}`
  )
  const presignedUrl = response.data.presigned_urls[0].presigned_url
  const getResponse = await axios.get(presignedUrl, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponse
}

export async function uploadTemplate(
  templateTitle,
  templateDescription,
  filename,
  template
) {
  await backendsPromise
  let templateId = null
  const response = await axios.post(`${visualisationApiUrl}/templates/`, {
    title: templateTitle,
    description: templateDescription,
    files: [filename],
    visualisation_builder: builderId,
  })
  const presignedUrl = response.data.presigned_urls[0].presigned_url
  templateId = response.data.id
  await axios.put(presignedUrl, JSON.stringify(template), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  await axios.patch(`${visualisationApiUrl}/templates/${templateId}`, {
    data_committed: true,
  })
  return templateId
}

export default {
  getInstance,
  setupSyncStore,
  uploadPlot,
  downloadPlot,
  uploadTemplate,
  downloadTemplate,
}
