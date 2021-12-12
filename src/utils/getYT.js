const yts = require('yt-search');
const Song = require('./song')

module.exports = (song) => {
  if (song instanceof Song) {
    return song
  }
  return yts(song).then(res => {
    const song = res.videos[0]
    const songData = {
      url: song.url,
      name: song.title,
    }
    return new Song(songData)
  })

}