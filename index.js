const Discord = require("discord.js");
const ytdl = require("ytdl-core");

require("dotenv").config();

const client = new Discord.Client();

const servers = {};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
  const msg = message.content.split(" ");
  switch (msg[0]) {
    case "#play": {
      const play = (connection, message) => {
        const server = servers[message.guild.id];

        message.channel.send("Now playing: " + server.queue[0] + "!");
        console.log(connection);
        server.dispatcher = connection.play(
          ytdl(server.queue[0], { filter: "audioonly" })
        );
        server.queue.shift();
        server.dispatcher.on("end", () => {
          if (server.queue[0]) {
            play(connection, message);
          } else {
            connection.disconnect();
          }
        });
      };

      if (!message.member.voice.channel.id) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      if (!servers[message.guild.id]) {
        servers[message.guild.id] = {
          queue: []
        };
      }
      const server = servers[message.guild.id];

      server.queue.push(msg[1]);
      if (!message.guild.voiceConnection) {
        message.member.voice.channel.join().then(connection => {
          play(connection, message);
        });
      }
      break;
    }
  }
});

client.login(process.env.TOKEN);
