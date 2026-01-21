export default {
  name: 'shuffle',
  description: 'Shuffles the current queue.',
  execute(server, message) {
    server.shuffleQueue(message);
  }
};
