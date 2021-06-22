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
  // Don't need to replace the urls locally because CORS isn't an issue
  nivsMinioUrl = null
  nidMinioUrl = null
  instanceID = 'b57525e7-0a5a-43da-b489-741c18c9f6d8'
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
