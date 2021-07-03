const ytdl = require('ytdl-core')
const download = require('../functions/download')
const compileSongs = require('../functions/compileSongs')
const songControls = require('../utils/songControls')
const { state } = require('../utils/servers')
const yts = require('yt-search');

module.exports = {
  name: 'mix',
  description: `Plays a mix of 2 youtube songs (\`${state.prefix}mix Seven Nation Army, Eurythmics - Sweet Dreams\`). It also works with youtube urls instead of names.`,
  needsVoiceChannel: true,
  args: true,
  usage: `\`${state.prefix}mix Seven Nation Army, Eurythmics - Sweet Dreams, \` or \n\`${state.prefix}mix https://www.youtube.com/watch?v=0J2QdDbelmY, https://www.youtube.com/watch?v=qeMFqkcPYcg\``,
  execute(server, message, args) {
    const songs = args.join(' ').split(',');

    if (songs.length < 2) {
      return message.channel.send("You need 2 or more songs to use this command.");
    }

    server.joinChannel(message.member.voice.channel).then(connection => {
      let promises = []
      let ready = []
      songs.forEach(song => {
        if (!ytdl.validateURL(song) && !ytdl.validateID(song)) {
          promises.push(
            yts(song)
          )
        } else {
          ready.push(song)
        }
      })


      Promise.all(promises).then(values => {
        songsToPlay = [...ready, ...values.map(song => song.videos[0].url)]
        server.addConvert(songsToPlay);
        download(server.convertQueue[0], (error, songPaths) => {
          if (error) {
            return message.channel.send(error);
          }
          // compile them together
          compileSongs(songPaths, (error, songPath) => {
            if (error) {
              // console.log(error)
              return message.channel.send("There was an error and couldn't play the song.");
            } else {
              // play the final file
              server.convertFinished();
              if (server.queue.length === 0 && !server.playing) {
                server.addSong({ url: songPath });
                songControls.nextSong(server, message);
              } else {
                server.addSong({ url: songPath });
                message.channel.send("Song mixed and added to queue.");
              }
            }
          });
        })

      })



    })
  }
};