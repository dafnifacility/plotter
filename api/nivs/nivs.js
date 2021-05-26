import {
  backendsPromise,
  discoveryApiUrl,
  visualisationApiUrl,
} from '~/api/backends/'
import axios from 'axios'
import { instanceId } from '~/constants/localUUIDs'

const stateFileName = 'state.json'

const builderId = 'a734e3e7-ca10-41f2-9638-a19710d6430d'

async function getDatasetUrlAndType() {
  await backendsPromise
  const response = await getDatasetIds()
  console.log(response)
  const ids = [response.data.visualisation_assets[0].asset_id]
  return axios
    .post(`${discoveryApiUrl}/version/metadata/`, {
      version_uuids: ids,
    })
    .then(response => {
      const urlsAndTypes = ids.map(id => {
        return {
          filename: response.data[id]['dcat:distribution'][0]['spdx:fileName'],
          url: response.data[id]['dcat:distribution'][0]['dcat:downloadURL'],
          type: response.data[id]['dcat:distribution'][0]['dcat:mediaType'],
        }
      })
      return urlsAndTypes
    })
}

async function setupSyncStore() {
  return await Promise.all([getPresignedURLforGET(), getPresignedURLforPUT()])
}

async function getDatasetIds() {
  await backendsPromise
  return axios.get(`${visualisationApiUrl}/instances/${instanceId}`)
}

async function getPresignedURLforGET() {
  await backendsPromise
  return axios
    .get(`${visualisationApiUrl}/instances/${instanceId}/state-sync`, {})
    .then(response => {
      const listOfFiles = response.data
      const correctFile = listOfFiles.find(e => e.file_name === stateFileName)
      if (correctFile) {
        return correctFile.presigned_url
      }
    })
}

async function getPresignedURLforPUT() {
  await backendsPromise
  return axios
    .post(`${visualisationApiUrl}/instances/${instanceId}/state-sync`, {
      files: [stateFileName],
    })
    .then(response => {
      return response.data[0].presigned_url
    })
}

async function uploadState(presignedUrl, state) {
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

async function downloadState(presignedUrl) {
  await backendsPromise
  return fetch(presignedUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => {
    if (!response.ok) {
      throw response.statusText
    }
    return response.json()
  })
}

async function downloadPlot(plotId) {
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

async function uploadPlot(plotTitle, plotDescription, filename, file) {
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

async function downloadTemplate(templateId) {
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

async function uploadTemplate(
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

export {
  setupSyncStore,
  uploadState,
  downloadState,
  uploadPlot,
  downloadPlot,
  uploadTemplate,
  downloadTemplate,
  getDatasetUrlAndType,
}
