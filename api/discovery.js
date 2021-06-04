import { backendsPromise, discoveryApiUrl } from '~/api/backends/'
import axios from 'axios'

export async function getMetadataForDatasets(ids) {
  await backendsPromise
  return axios.post(`${discoveryApiUrl}/version/metadata/`, {
    version_uuids: ids,
  })
}

export default { getMetadataForDatasets }
