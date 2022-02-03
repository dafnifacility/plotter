import axios from 'axios'

/* eslint-disable */
export let visualisationApiUrl = process.env.visualisationApiUrl
export let dssauthUrl = process.env.dssauthUrl
export let nidApiUrl = process.env.nidApiUrl
export let nivsMinioUrl = process.env.nivsMinioUrl
export let nidMinioUrl = process.env.nidMinioUrl
export let environment = process.env.environment
export let instanceID = process.env.INSTANCE_ID

const appMode = process.env.NODE_ENV

function useDefaultAPIUrls() {
  visualisationApiUrl =
    'https://dafni-nivs-api.secure.dafni.rl.ac.uk'
  dssauthUrl =
    'https://dafni-dss-dssauth.secure.dafni.rl.ac.uk'
  nidApiUrl =
    'https://dafni-nid-api.secure.dafni.rl.ac.uk/nid'
  // Don't need to replace the urls locally because CORS isn't an issue
  nivsMinioUrl = 'https://fwd.secure.dafni.rl.ac.uk/nivsstore'
  nidMinioUrl = 'https://fwd.secure.dafni.rl.ac.uk/nidminio'
  instanceID = '0aac6c3d-cf17-4bbe-8d23-d2ae1d633d7d'
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
