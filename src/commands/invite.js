export default {
  name: "invite",
  description: "Displays the link for inviting the bot to your server",
  execute(server, message) {
    server.channel.send({ content: "You can invite the bot using this link: https://discord.com/oauth2/authorize?client_id=690912235052335166&permissions=8&scope=bot." });
  }
};
