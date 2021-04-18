'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Playlists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      tracks: {
        type: Sequelize.ARRAY(Sequelize.JSONB),
        allowNull: false
      },
      guild_instance: {
        type: Sequelize.BIGINT,
        references: {
          model: {
            tableName: 'Guilds',
            schema: 'public'
          },
          key: 'guild_id',
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Playlists');
  }
};