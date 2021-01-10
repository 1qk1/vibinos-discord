const joinChannel = (server, channel) => {
  return channel.join().then(connection => {
    server.connection = connection;
    server.botChannel = channel;
    return connection
  });
}
const leaveChannel = (server, channel) => {
  server.botChannel.leave();
  server.connection = null;
  server.botChannel = null;
  return;
}



module.exports = {
  joinChannel,
  leaveChannel
}