export default class {
  constructor({
    url,
    name,
    addedBy,
    videoId
  } = {}) {
    this.url = url
    this.name = name
    this.addedBy = addedBy
    this.videoId = videoId
  }
}