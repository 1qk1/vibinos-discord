const ytdl = require("ytdl-core");

const playSong = () => {
  if (!message.member.voiceChannel) {
    return message.channel.send("You must be in a channel to play the bot.");
  }
  message.channel.send("Now playing: " + songs.join(", ") + "!");
};

module.exports = playSong
