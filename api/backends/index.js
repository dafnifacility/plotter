import axios from 'axios'

/* eslint-disable */
export let visualisationApiUrl = process.env.visualisationApiUrl
export let dssauthUrl = process.env.dssauthUrl
export let discoveryApiUrl = process.env.discoveryApiUrl
export let environment = process.env.environment
export let instanceID = process.env.INSTANCE_ID

const appMode = process.env.NODE_ENV
if (appMode !== 'production') {
  visualisationApiUrl =
    'https://dafni-nivs-api-review-dev-4jxwt5.staging.dafni.rl.ac.uk'
  dssauthUrl =
    'https://dafni-dss-dssauth-review-dev-o2yn5p.staging.dafni.rl.ac.uk'
  discoveryApiUrl =
    'https://dafni-search-and-discovery-api-review-dev-4jxwt5.staging.dafni.rl.ac.uk'
  environment = 'dev'
  instanceID = 'd1af8090-ec1c-467e-9a46-2027c659d9bc'
}

async function backends() {
  try {
    const response = await axios.get('/backends/backends.json')
    visualisationApiUrl = response.data.visualisationApiUrl
    dssauthUrl = response.data.dssauthUrl
    discoveryApiUrl = response.data.discoveryApiUrl
    environment = response.data.node_env
    instanceID = response.data.instanceID
  } catch (error) {
    console.error('Error while loading settings from server' + error)
  }
}

export let backendsPromise = backends()
