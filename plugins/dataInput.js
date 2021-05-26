import { csvFiles, geojsonFiles, topojsonFiles } from '~/constants/data'
import axios from 'axios'
import { getDatasetUrlAndType } from '~/api/nivs'

const appMode = process.env.NODE_ENV

let inputCsvFiles = csvFiles
let inputTopojsonFiles = topojsonFiles
let inputGeojsonFiles = geojsonFiles

export function getCsvFiles() {
  return inputCsvFiles
}

export function getTopojsonFiles() {
  return inputTopojsonFiles
}

export function getGeojsonFiles() {
  return inputGeojsonFiles
}

export async function getDatasets() {
  try {
    const response = await getInstance()
    console.log(response)
    const ids = [response.data.visualisation_assets[0].asset_id]
  } catch {}
  try {
    const dataFiles = await getDatasetUrlAndType()
    inputCsvFiles = []
    inputTopojsonFiles = []
    inputGeojsonFiles = []
    for (let i = 0; i < dataFiles.length; i++) {
      const file = dataFiles[i]
      const extension = file.filename.split('.').pop()
      if (extension === 'csv') {
        inputCsvFiles.push(file)
      } else if (extension === 'topojson') {
        inputTopojsonFiles.push(file)
      } else if (extension === 'geojson') {
        inputGeojsonFiles.push(file)
      }
    }
  } catch (error) {
    console.log('Error while loading in datafiles' + error)
  }
}
