const download = require('../functions/download')
const compileSongs = require('../functions/compileSongs')
const { state } = require('../utils/servers')
const yts = require('yt-search');
const Song = require('../utils/song')

module.exports = {
  name: 'mix',
  description: `Plays a mix of 2 youtube songs (\`${state.prefix}mix Seven Nation Army, Eurythmics - Sweet Dreams\`). It also works with youtube urls instead of names.`,
  needsVoiceChannel: true,
  autoJoin: true,
  args: true,
  usage: `\`${state.prefix}mix Seven Nation Army, Eurythmics - Sweet Dreams, \` or \n\`${state.prefix}mix https://www.youtube.com/watch?v=0J2QdDbelmY, https://www.youtube.com/watch?v=qeMFqkcPYcg\``,
  execute(server, message, args) {
    const songs = args.join('').split(',');

    if (songs.length < 2) {
      return server.channel.send("You need 2 or more songs to use this command.");
    }

    let promises = songs.map(song => yts(song))

    Promise.all(promises).then(values => {
      songsToPlay = values.map(song => song.videos[0].url)
      const songTitles = values.map(song => song.videos[0].title).join(', ')
      server.addConvert(songsToPlay);
      download(server.convertQueue[0], (error, songPaths) => {
        if (error) {
          return server.channel.send(error);
        }
        // compile them together
        compileSongs(songPaths, async (error, songPath) => {
          if (error) {
            return server.channel.send("There was an error and couldn't play the song.");
          } else {
            // play the final file
            // const songName = 
            server.convertFinished();
            const playing = server.playing
            await server.addSong(new Song({ name: `Mix: ${songTitles}`, url: songPath }), false);
            if (playing) {
              server.channel.send("Song mixed and added to queue.");
            }
          }
        });
      })

    })
  }
};
