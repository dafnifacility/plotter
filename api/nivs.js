import { backendsPromise, visualisationApiUrl } from '~/api/backends/'
import axios from 'axios'
import { instanceId } from '~/constants/localUUIDs'

const stateFileName = 'state.json'
const builderId = 'a734e3e7-ca10-41f2-9638-a19710d6430d'

export async function setupSyncStore() {
  return await Promise.all([getPresignedURLforGET(), getPresignedURLforPUT()])
}

export async function getInstance() {
  await backendsPromise
  return axios.get(`${visualisationApiUrl}/instances/${instanceId}`)
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
  return axios
    .get(`${visualisationApiUrl}/plots/${plotId}`)
    .then(response => {
      const presignedUrl = response.data.presigned_urls[0].presigned_url
      return fetch(presignedUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'image/png',
        },
      })
    })
    .then(response => {
      return response.data
    })
}

export async function uploadPlot(plotTitle, plotDescription, filename, file) {
  await backendsPromise
  let plotId = null
  return axios
    .post(`${visualisationApiUrl}/plots`, {
      title: plotTitle,
      description: plotDescription,
      files: [filename],
      visualisation_instance: instanceId,
    })
    .then(postResponse => {
      const presignedUrl = postResponse.data.presigned_urls[0].presigned_url
      plotId = postResponse.data.id
      return fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'image/png',
        },
      })
    })
    .then(putResponse => {
      if (!putResponse.ok) {
        throw putResponse.statusText
      }
      return axios.patch(`${visualisationApiUrl}/plots/${plotId}`, {
        data_committed: true,
      })
    })
    .then(() => {
      return plotId
    })
}

export async function downloadTemplate(templateId) {
  await backendsPromise
  return axios
    .get(`${visualisationApiUrl}/templates/${templateId}`)
    .then(response => {
      const presignedUrl = response.data.presigned_urls[0].presigned_url
      return fetch(presignedUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
    .then(response => {
      return response.json()
    })
}

export async function uploadTemplate(
  templateTitle,
  templateDescription,
  filename,
  template
) {
  await backendsPromise
  let templateId = null
  return axios
    .post(`${visualisationApiUrl}/templates/`, {
      title: templateTitle,
      description: templateDescription,
      files: [filename],
      visualisation_builder: builderId,
    })
    .then(postResponse => {
      const presignedUrl = postResponse.data.presigned_urls[0].presigned_url
      templateId = postResponse.data.id
      return fetch(presignedUrl, {
        method: 'PUT',
        body: JSON.stringify(template),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
    .then(putResponse => {
      if (!putResponse.ok) {
        throw putResponse.statusText
      }
      return axios.patch(`${visualisationApiUrl}/templates/${templateId}`, {
        data_committed: true,
      })
    })
    .then(() => {
      return templateId
    })
}

export default {
  getInstance,
  setupSyncStore,
  uploadPlot,
  downloadPlot,
  uploadTemplate,
  downloadTemplate,
}
