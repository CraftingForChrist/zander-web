const Discord = require('discord.js');
const config = require('../../config.json');
const chalk = require('chalk');
const database = require('../../controllers/database.js'); // Database controller
const mojangapi = require('mojang-api');

module.exports.run = async (client, message, args) => {
  // Checks if the user has permissions to run the command.
  if (!message.member.hasPermission(`${module.exports.help.permission}`)) {
    let embed = new Discord.RichEmbed()
      .setTitle('Error!')
      .setColor('#ff6666')
      .setDescription('You do not have permissions to run this command.')
    message.channel.send(embed);
    return;
  }

  //
  // Database Entry
  //
  let sql = `SELECT 1 FROM playerdata WHERE username = '${args[0]}';`;
  database.query (sql, function (err, results) {
    if (err) {
      throw err;
    } else {
      if (!results.length) {
        let embed = new Discord.RichEmbed()
           .setTitle('Error!')
           .setColor('#ff6666')
           .setDescription('This user does not exist.')
        message.channel.send(embed);
        return;
      }

      let sql = `select max(gs.sessionstart) as 'lastlogin', pd.username as 'username', gs.ipaddress as 'ipaddress' from gamesessions gs, playerdata pd where gs.player_id = pd.id and gs.ipaddress in (select distinct gs1.ipaddress from gamesessions gs1, playerdata pd1 where pd1.id = gs1.player_id and pd1.username like '${args[0]}') group by pd.username, gs.ipaddress order by max(gs.sessionstart) asc;`;
      database.query (sql, function (err, results) {
        if (err) {
          throw err;
        } else {
          let embed = new Discord.RichEmbed()
          .setTitle(`${args[0]}'s Connected Accounts`)
          .setColor('#4d79ff')

          results.forEach(function(playeripdata) {
            embed.addField(`${playeripdata.username}`, `Last Login: ${playeripdata.lastlogin}`)
          })
          message.channel.send(embed);
        }
      });
    }
  })
};

module.exports.help = {
  name: 'ipcheck',
  description: 'Checks the accounts connected to the players name.',
  permission: 'MANAGE_MESSAGES',
  usage: 'ipcheck [username]'
};
