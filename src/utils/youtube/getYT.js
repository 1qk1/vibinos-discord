import yts from 'yt-search';
import Song from '../models/song.js';
import ytdl from 'ytdl-core';

export default (song) => {
  let searchSong = song.name
  if (song.url && (ytdl.validateID(song.url) || ytdl.validateURL(song.url))) {
    searchSong = { videoId: ytdl.getVideoID(song.url) }
  }
  return yts(searchSong).then(res => {
    const ytSong = !res.videos ? res : res.videos[0]
    console.log(ytSong)
    const songData = {
      videoId: ytSong.videoId,
      url: ytSong.url,
      name: ytSong.title,
      addedBy: song.addedBy
    }
    return new Song(songData)
  })

}