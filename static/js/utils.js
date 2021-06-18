export function deepCopy(item, defaultObj) {
  if (item) {
    return JSON.parse(JSON.stringify(item))
  }
  return defaultObj
}

export default {
  deepCopy,
}
