const {state} = require('../utils/servers');
const download = require('../functions/download')
const compileSongs = require('../functions/compileSongs')
const songControls = require('../utils/songControls')

const playHandler = (server, message, splitted) => {
  if (!state.get(message.guild.id)) {
    state.add(message.guild.id);
  }
  server.addConvert(splitted.slice(1));
  message.member.voice.channel.join().then(connection => {
    server.connection = connection
    // download the files
    download(server.convertQueue[0], (error, songPaths) => {
      if (error) {
        return message.channel.send(error);
      }
      // compile them together
      compileSongs(songPaths, (error, songPath) => {
        if (error) {
          return message.channel.send("There was an error and couldn't play the song.");
        } else {
          // play the final file
          if (server.queue.length == 0) {
            server.addSong(songPath);
            songControls.playSong(server);
            message.channel.send("Playing song.");
          } else {
            server.addSong(songPath);
          }
        }
      });
    })
  });
}

module.exports = playHandler