import { backendsPromise, nidApiUrl } from '~/api/backends/'
import axios from 'axios'

export async function getMetadataForDatasets(ids) {
  await backendsPromise
  return axios.post(`${nidApiUrl}/version/metadata/`, {
    version_uuids: ids,
  })
}

export default { getMetadataForDatasets }
