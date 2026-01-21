import SpotifyWebApi from 'spotify-web-api-node';

const clientId = process.env.SPOTIFY_CLIENT_ID,
  clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const initAPI = async () => {
  // Create the api object with the credentials
  const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret
  });
  // Retrieve an access token.
  const data = await spotifyApi.clientCredentialsGrant()
  spotifyApi.setAccessToken(data.body['access_token']);
  return spotifyApi
}

const spotifyApi = async () => await initAPI()

const getPlaylistTracks = async (playlist) => {
  const api = await initAPI()
  let tracks = []
  let run = true
  let index = 0
  while (run === true) {
    const results = await api.getPlaylistTracks(playlist, {
      offset: index,
      limit: 100,
      fields: 'items'
    })
    if (results.body.items.length === 100) {
      index += 100
    } else {
      run = false
    }
    tracks = [...tracks, ...results.body.items]
  }
  return tracks
}

export { spotifyApi, getPlaylistTracks }