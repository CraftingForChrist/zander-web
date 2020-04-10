const Discord = require('discord.js');
const config = require('../../config.json');
const chalk = require('chalk');
const database = require('../../controllers/database.js'); // Database controller

module.exports.run = async (client, message, args) => {
  // Checks if the user is in the Discord and exists.
  let user = message.mentions.members.first();
  if (!user) {
    let embed = new Discord.RichEmbed()
      .setTitle('Error!')
      .setColor('#ff6666')
      .setDescription('This user does not exist.')
    message.channel.send(embed);
    return;
  }

  // Check for a punishement reason.
  let reason = args.slice(1).join(' ');
  if (!reason) {
    let embed = new Discord.RichEmbed()
      .setTitle('Error!')
      .setColor('#ff6666')
      .setDescription('Please provide a reason for your report.')
    message.channel.send(embed);
    return;
  }

  let createdAtRaw = message.createdAt.toDateString();
  let createdAt = createdAtRaw.split(' ');

  let embed = new Discord.RichEmbed()
    .setTitle('Incoming Discord Report')
    .setColor('#4d79ff')
    .setDescription(`${message.author} has reported ${user} for ${reason}`)

  let reportschannel = message.guild.channels.cache.find(c => c.name === 'reports');
  reportschannel.send(embed).catch(e => {
    let embed = new Discord.RichEmbed()
      .setTitle('Error!')
      .setColor('#ffa366')
      .setDescription(`There is no #reports channel, can't display details.`)
    message.channel.send(embed);
    return;
  });

  message.delete(3000);
  let confirmembed = new Discord.RichEmbed()
    .setTitle('Error!')
    .setColor('#7CFC00')
    .setDescription('Your report has been sent to the Server Staff.')
  message.channel.send(confirmembed).then(msg => {msg.delete(3000)});

  console.log(chalk.yellow('[CONSOLE] ' ) + chalk.blue('[DISCORD] ') + `${message.author.username} has reported ${user.user.username} for ${reason}.`);
  return;
};

module.exports.help = {
  name: 'report',
  description: 'Report a user, with the reason provided.',
  usage: 'report [@user] [reason]'
};
