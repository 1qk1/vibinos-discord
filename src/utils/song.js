module.exports = class {
  constructor({
    url,
    name,
    addedBy
  } = {}) {
    this.url = url
    this.name = name
    this.addedBy = addedBy
  }
}