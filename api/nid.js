import { backendsPromise, nidApiUrl } from '~/api/backends/'
import axios from 'axios'

export async function getUrlsForDatasets(ids) {
  await backendsPromise
  return axios.post(`${nidApiUrl}/version/batch/`, {
    version_uuids: ids,
  })
}

export default { getUrlsForDatasets }
