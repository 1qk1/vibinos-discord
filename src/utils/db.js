const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres'
});

sequelize.authenticate().then(() => {
  console.log('Database connection has been established successfully.',);
}).catch(error => {
  console.error('Unable to connect to the database:', error);
});


const Guild = sequelize.define('Guild', {
  // Model attributes are defined here
  guild_id: {
    type: DataTypes.BIGINT,
    unique: true
  }
});
const Playlist = sequelize.define('Playlist', {
  // Model attributes are defined here
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
      model: Guild,
      key: 'guild_id',
    }
  }
});

module.exports = {
  sequelize,
  Guild,
  Playlist
}