const yts = require('yt-search');
const Song = require('./song')
const ytdl = require('ytdl-core');

module.exports = (song) => {
  let searchSong = song
  if (song instanceof Song) {
    return song
  }
  if (ytdl.validateID(song) || ytdl.validateURL(song)) {
    searchSong = { videoId: ytdl.getVideoID(song) }
  }
  return yts(searchSong).then(res => {
    const song = res instanceof Object ? res : res.videos[0]
    const songData = {
      url: song.url,
      name: song.title,
    }
    return new Song(songData)
  })

}