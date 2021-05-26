import { backendsPromise, discoveryApiUrl } from '~/api/backends/'
import axios from 'axios'

export async function getMetadataForDatasets(ids) {
  await backendsPromise
  return axios.post(`${discoveryApiUrl}/version/metadata/`, {
    version_uuids: ids,
  })
}

// export async function getDatasetUrlAndType() {
//   await backendsPromise
//     .then(response => {
//       const urlsAndTypes = ids.map(id => {
//         return {
//           filename: response.data[id]['dcat:distribution'][0]['spdx:fileName'],
//           url: response.data[id]['dcat:distribution'][0]['dcat:downloadURL'],
//           type: response.data[id]['dcat:distribution'][0]['dcat:mediaType'],
//         }
//       })
//       return urlsAndTypes
//     })
// }

export default { getMetadataForDatasets }
