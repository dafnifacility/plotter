import { instanceID, visualisationApiUrl } from '~/api/backends/'
import axios from 'axios'
import { downloadFileFromMinio } from '~/api/minio'

const stateFileName = 'state.json'
const builderId = 'a734e3e7-ca10-41f2-9638-a19710d6430d'

export async function setupSyncStore() {
  return await Promise.all([getPresignedURLforGET(), getPresignedURLforPUT()])
}

export async function getInstance() {
  return await axios.get(`${visualisationApiUrl}/instances/${instanceID}`)
}

function getStateFileUrl(listOfFiles) {
  const correctFile = listOfFiles.find(e => e.file_name === stateFileName)
  if (correctFile) {
    return correctFile.presigned_url
  }
  return null
}

export async function getPresignedURLforGET() {
  const response = await axios.get(
    `${visualisationApiUrl}/instances/${instanceID}/state-sync`
  )
  return getStateFileUrl(response.data)
}

export async function getPresignedURLforPUT() {
  const response = await axios.post(
    `${visualisationApiUrl}/instances/${instanceID}/state-sync`,
    {
      files: [stateFileName],
    }
  )
  return getStateFileUrl(response.data)
}

export async function downloadPlot(plotId) {
  const response = await axios.get(`${visualisationApiUrl}/plots/${plotId}`)
  const presignedUrl = response.data.presigned_urls[0].presigned_url
  return await downloadFileFromMinio(presignedUrl)
}

export async function uploadPlot(plotTitle, plotDescription, filename, file) {
  let plotId = null
  const postResponse = await axios.post(`${visualisationApiUrl}/plots`, {
    title: plotTitle,
    description: plotDescription,
    files: [filename],
    visualisation_instance: instanceID,
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
  const response = await axios.get(
    `${visualisationApiUrl}/templates/${templateId}`
  )
  const presignedUrl = response.data.presigned_urls[0].presigned_url
  return await downloadFileFromMinio(presignedUrl)
}

export async function uploadTemplate(
  templateTitle,
  templateDescription,
  filename,
  template
) {
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
