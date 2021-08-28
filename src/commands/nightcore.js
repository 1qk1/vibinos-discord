module.exports = {
  name: 'nightcore',
  description: 'Turns nightcore mode on or off',
  execute(server, message) {
    server.toggleNightcore(message);
  }
};
