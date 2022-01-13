const yts = require('yt-search');
const Song = require('./song')
const ytdl = require('ytdl-core');

module.exports = (song) => {
  let searchSong = song.name
  if (ytdl.validateID(song.url) || ytdl.validateURL(song.url)) {
    searchSong = { videoId: ytdl.getVideoID(song.url) }
  }
  return yts(searchSong).then(res => {
    const song = !res.videos ? res : res.videos[0]
    const songData = {
      url: song.url,
      name: song.title,
      addedBy: song.addedBy
    }
    return new Song(songData)
  })

}