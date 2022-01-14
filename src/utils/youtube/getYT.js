const yts = require('yt-search');
const Song = require('../models/song')
const ytdl = require('ytdl-core');

module.exports = (song) => {
  let searchSong = song.name
  if (ytdl.validateID(song.url) || ytdl.validateURL(song.url)) {
    searchSong = { videoId: ytdl.getVideoID(song.url) }
  }
  return yts(searchSong).then(res => {
    const ytSong = !res.videos ? res : res.videos[0]
    const songData = {
      url: ytSong.url,
      name: ytSong.title,
      addedBy: song.addedBy
    }
    return new Song(songData)
  })

}