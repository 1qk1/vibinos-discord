const getYoutubeURL = url => url.match(/([a-zA-Z0-9-_]{11})(?:\.mp4)$/)[1]

export { getYoutubeURL }