'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Playlist.init({
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    tracks: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: false
    },
    guild_instance: {
      type: DataTypes.BIGINT,
      references: {
        model: {
          tableName: 'Guilds',
          schema: 'schema'
        },
        key: 'guild_id',
      }
    }
  }, {
    sequelize,
    modelName: 'Playlist',
  });
  return Playlist;
};