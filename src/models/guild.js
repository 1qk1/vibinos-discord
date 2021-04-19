const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guild_id: {
    type: mongoose.SchemaTypes.Number,
    unique: true
  }
});
guildSchema.index({ guild_id: 1 });

const Guild = mongoose.model("guild", guildSchema);

module.exports = Guild;
