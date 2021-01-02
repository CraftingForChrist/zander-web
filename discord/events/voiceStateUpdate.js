const Discord = require("discord.js");
const config = require("../../config.json");
const HexColour = require("../../HexColour.json");

module.exports = async (oldState, newState) => {
  let oldStateVoice = oldState.voiceChannelID;
  let newStateVoice = newState.voiceChannelID;
  let adminlogchannel = oldState.guild.channels.cache.find(c => c.name === 'admin-log');

  if (oldStateVoice != newStateVoice) {
    // User has joined the voice channel.
    let embed = new Discord.MessageEmbed()
      .setTitle('Channel Joined')
      .setDescription(`${oldState.member.user.username} has switched from ${oldState.channel.name}`)
      .setColor(HexColour.green)
    adminlogchannel.send(embed);

  } else if (oldStateVoice === undefined && newStateVoice !== undefined) {
    // User has left the voice channel.
    let embed = new Discord.MessageEmbed()
      .setTitle('Channel Left')
      .setDescription(`${oldState.member.user.username} has left from ${oldState.channel.name}`)
      .setColor(HexColour.red)
    adminlogchannel.send(embed);

  } else {
    // User has switched voice channels.
    let embed = new Discord.MessageEmbed()
      .setTitle('Channel Switched')
      .setDescription(`${oldState.member.user.username} has switched from ${oldState.channel.name}`)
      .setColor(HexColour.yellow)
    adminlogchannel.send(embed);
  }
}
