const express = require('express');
const router = express.Router();
const config = require('../../../config.json');
const database = require('../../../controllers/database.js');
const Discord = require('discord.js');
const client = new Discord.Client({ disableEveryone: true });

module.exports = (client) => {
  router.get('/', (req, res, next) => {
    if (req.session.user) {

    } else {
      res.render('session/login', {
        setValue: true,
        message: 'You cannot access this page unless you are logged in.',
        "pagetitle": "Login"
      });
    };
  });

  router.post('/', function (req, res) {
    if (req.session.user) {
      const id = req.body.id;
      const name = req.body.name;
      const icon = req.body.icon;
      const date = req.body.date;
      const time = req.body.time;
      const information = req.body.information;

      database.query(`UPDATE events SET eventtitle=?, eventicon=?, eventdate=?, eventtime=?, eventinformation=? WHERE id=?`, [name, icon, date, time, information, id], function (error, results, fields) {
        if (error) {
          res.redirect('/');
          throw error;
        } else {
          res.redirect('/admin/events');

          // Take event that was edited and announce updates.
          let eventschannel = client.channels.cache.find(c => c.name === `${config.eventschannel}`);
          if (!eventschannel) return console.log(`A #${config.eventschannel} channel does not exist.`);

          var embed = new Discord.MessageEmbed()
            .setTitle(`Event Update`)
            .setDescription(`The ${name} event information has been updated.\nGo to ${config.website}events to see more information.`)
            .setThumbnail(icon)
            .setColor('#99ddff')
          eventschannel.send(embed);
          console.log(`[CONSOLE] [DISCORD] The new Event has been broadcasted to Discord.`);
        };
      });
    } else {
      res.render('session/login', {
        setValue: true,
        message: 'You cannot access this page unless you are logged in.',
        "pagetitle": "Login"
      });
    };
  });

  return router;
};
