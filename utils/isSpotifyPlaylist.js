var Url = require('url-parse');

const isSpotifyPlaylist = (url) => {
  const urlObj = new Url(url);
  if (urlObj.host === 'open.spotify.com' && urlObj.pathname.match(/\/playlist.+/ig)) {
    return true
  }
  if (url.match(/(?:spotify\:playlist\:)([a-zA-Z0-9]*)/)) return true
  return false
}
const getPlaylistID = (url) => {
  const urlObj = new Url(url);
  const fromURL = urlObj.pathname.match(/(?:\/playlist\/)([a-zA-Z0-9]*)/)
  if (urlObj.host === 'open.spotify.com' && fromURL) {
    return fromURL[1]
  }
  playlistID = url.match(/(?:spotify\:playlist\:)([a-zA-Z0-9]*)/)
  if (playlistID)
    return playlistID[1];
}

module.exports = { isSpotifyPlaylist, getPlaylistID }