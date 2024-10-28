import axios from 'axios'

/* eslint-disable */
export let visualisationApiUrl = process.env.visualisationApiUrl
export let dssauthUrl = process.env.dssauthUrl
export let nidApiUrl = process.env.nidApiUrl
export let environment = process.env.environment
export let instanceID = process.env.INSTANCE_ID

const appMode = process.env.NODE_ENV

function useDefaultAPIUrls() {
  visualisationApiUrl =
    'https://dafni-nivs-api-review-dev-4jxwt5.staging.dafni.rl.ac.uk'
  dssauthUrl =
    'https://dafni-dss-dssauth-review-dev-o2yn5p.staging.dafni.rl.ac.uk'
  nidApiUrl =
    'https://dafni-nid-api-review-dev-4jxwt5.staging.dafni.rl.ac.uk/nid'
  instanceID = '2133fb7b-1b28-4ef5-9e9c-1fc11e0ce24b'
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
    nidApiUrl = response.data.nidApiUrl
    environment = response.data.node_env
    instanceID = response.data.instanceID
  } catch (error) {
    console.error(`Error while loading settings from server: ${error}`)
    useDefaultAPIUrls()
  }
}

export let backendsPromise = backends()
