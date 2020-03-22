const fs = require("fs");
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

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
        // download the files
        // run ffmpeg -i 1.mp3 -i 2.mp3 -filter_complex amix=inputs=2:duration=shortest:dropout_transition=3 3.mp3
        // to the connection.play

        // fs.unlinkSync(__dirname + "/1.mp3");
        // fs.unlinkSync(__dirname + "/2.mp3");
        ytdl(server.queue[0][0], {
          filter: "audioonly",
          quality: "highestaudio"
        })
          .pipe(fs.createWriteStream(__dirname + "/songs/1.mp3"))
          .on("close", () => {
            ytdl(server.queue[0][1], {
              filter: "audioonly",
              quality: "highestaudio"
            })
              .pipe(fs.createWriteStream(__dirname + "/songs/2.mp3"))
              .on("close", () => {
                message.channel.send(
                  "Now playing: " + server.queue[0].join(" ") + "!"
                );
                // ffmpeg -i 1.mp3 -i 2.mp3 -filter_complex amix=inputs=2:duration=shortest:dropout_transition=2 3.mp3
                ffmpeg()
                  .input(__dirname + "/songs/1.mp3")
                  .input(__dirname + "/songs/2.mp3")
                  .inputOptions([
                    "-filter_complex",
                    "amix=inputs=2:duration=shortest:dropout_transition=2"
                  ])
                  .save(__dirname + "/songs/3.mp3");
                server.dispatcher = connection.play(
                  fs.createReadStream(__dirname + "/songs/3.mp3")
                );
                server.queue.shift();
                server.dispatcher.on("end", () => {
                  if (server.queue[0]) {
                    play(connection, message);
                  } else {
                    connection.disconnect();
                  }
                });
              });
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

      server.queue.push(msg.slice(1));
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
