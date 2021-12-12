module.exports = {
  name: 'queue',
  aliases: ["q"],
  description: 'Show all queued songs.',
  execute(server, message, args) {
    return server.showQueue(args[0], message)
  }
};
