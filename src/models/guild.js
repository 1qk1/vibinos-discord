'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guild extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Guild.init({
    guild_id: {
      type: DataTypes.BIGINT,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Guild',
  });
  return Guild;
};