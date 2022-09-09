import axios from 'axios'
import { nidApiUrl } from '~/api/backends/'

export async function getUrlsForDatasets(ids) {
  return await axios.post(`${nidApiUrl}/version/batch/`, {
    version_uuids: ids,
  })
}

export default { getUrlsForDatasets }
