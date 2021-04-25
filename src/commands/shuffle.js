module.exports = {
  name: 'shuffle',
  description: 'Turns shuffle on or off',
  execute(server, message) {
    server.toggleShuffle(message);
  }
};
