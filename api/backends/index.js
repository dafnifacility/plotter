import axios from 'axios'

/* eslint-disable */
export let visualisationApiUrl = process.env.visualisationApiUrl
export let dssauthUrl = process.env.dssauthUrl
export let discoveryApiUrl = process.env.discoveryApiUrl
export let nivsMinioUrl = process.env.nivsMinioUrl
export let nidMinioUrl = process.env.nidMinioUrl
export let environment = process.env.environment
export let instanceID = process.env.INSTANCE_ID

const appMode = process.env.NODE_ENV

function useDefaultAPIUrls() {
  visualisationApiUrl =
    'https://dafni-nivs-api-review-dev-4jxwt5.staging.dafni.rl.ac.uk'
  dssauthUrl =
    'https://dafni-dss-dssauth-review-dev-o2yn5p.staging.dafni.rl.ac.uk'
  discoveryApiUrl =
    'https://dafni-search-and-discovery-api-review-dev-4jxwt5.staging.dafni.rl.ac.uk'
  nivsMinioUrl = null
  nidMinioUrl = null
  instanceID = 'd1af8090-ec1c-467e-9a46-2027c659d9bc'
}

if (appMode !== 'production') {
  useDefaultAPIUrls()
  environment = "dev"
}

async function backends() {
  try {
    const response = await axios.get('./backends/backends.json')
    visualisationApiUrl = response.data.visualisationApiUrl
    dssauthUrl = response.data.dssauthUrl
    discoveryApiUrl = response.data.discoveryApiUrl
    nivsMinioUrl = response.data.nivsMinioUrl
    nidMinioUrl = response.data.nidMinioUrl
    environment = response.data.node_env
    instanceID = response.data.instanceID
  } catch (error) {
    console.error(`Error while loading settings from server: ${error}`)
    useDefaultAPIUrls()
  }
}

export let backendsPromise = backends()
