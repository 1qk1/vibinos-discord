const mongoose = require("mongoose");
const Guild = require('./guild')

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    validate: {
      validator: async function (v) {
        const xd = await Playlist.find({
          $and: [
            { name: v },
            { guild_instance: this.guild_instance }
          ]
        })
        return xd.length === 0
      },
      message: props => `${props.value} is not a valid phone number!`
    },
  },
  tracks: {
    type: [{
      url: String,
      name: String
    }]
  },
  guild_instance: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "guild",
    required: true
  }
});
playlistSchema.index({ name: 1 });

const Playlist = mongoose.model("playlist", playlistSchema);

module.exports = Playlist;
