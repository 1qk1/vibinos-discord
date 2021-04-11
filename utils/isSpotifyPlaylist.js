var Url = require('url-parse');

const isSpotifyPlaylist = (url) => {
  const urlObj = new Url(url);
  console.log(urlObj)
  if (urlObj.host === 'open.spotify.com' && urlObj.pathname.match(/\/playlist.+/ig)) {
    return true
  }
  return false;
}

module.exports = isSpotifyPlaylist