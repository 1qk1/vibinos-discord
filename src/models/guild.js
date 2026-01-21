import mongoose from "mongoose";

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
// guildSchema.index({ guild_id: 1 }); // Removed duplicate index - unique: true already creates an index

const Guild = mongoose.model("guild", guildSchema);

export default Guild;