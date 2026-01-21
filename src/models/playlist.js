import mongoose from "mongoose";
import Guild from './guild.js';

const memberSchema = new mongoose.Schema({
  member_id: {
    type: mongoose.SchemaTypes.String,
    unique: true
  },
  name: mongoose.SchemaTypes.String,
});

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
  },
  addedBy: memberSchema
});
playlistSchema.index({ name: 1 });

const Playlist = mongoose.model("playlist", playlistSchema);

export default Playlist