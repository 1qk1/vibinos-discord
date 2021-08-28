const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guild_id: {
    type: mongoose.SchemaTypes.String,
    unique: true
  },
  quality: {
    type: mongoose.SchemaTypes.Number,
    default: 64
  },
});
guildSchema.index({ guild_id: 1 });

const Guild = mongoose.model("guild", guildSchema);

module.exports = Guild;
