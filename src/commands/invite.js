module.exports = {
  name: "invite",
  description: "Displays the link for inviting the bot to your server",
  execute(server, message) {
    message.channel.send("You can invite the bot using this link: https://discord.com/oauth2/authorize?client_id=690912235052335166&permissions=8&scope=bot.");
  }
};
