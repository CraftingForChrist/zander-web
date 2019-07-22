//
// Project Dependencies
//
const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const mysql = require('mysql');
const ejs = require('ejs');
const package = require('./package.json');
const config = require('./config.json');
const credentials = require('./credentials.json');
const request = require('request');
const Discord = require('discord.js');
const client = new Discord.Client({
  disableEveryone: true
});

//
// Constants
//
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
var obj = {};
var session;

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('./public'));

const connection = mysql.createConnection({
  host: process.env.dbhost || credentials.dbhost,
  user: process.env.dbuser || credentials.dbuser,
  password: process.env.dbpassword || credentials.dbpassword,
  database: process.env.dbdatabase || credentials.dbdatabase,
  multipleStatements: true
});

connection.connect(function(err) {
  if (err) {
    console.error(chalk.red('[ERROR] ') + chalk.blue('[DB] ') +  'There was an error connecting:\n' + err.stack);
    return;
  }
  console.log(chalk.yellow('[CONSOLE] ' ) + chalk.blue('[DB] ') + 'Database connection is successful. Your connection ID is ' + connection.threadId + '.');
});

//
// Homepage
//
app.get('/', function (req, res) {
  res.render('index', {
    "servername": `${config.servername}`,
    "sitecolour": `${config.sitecolour}`,
    "email": `${config.email}`,
    "pagetitle": "Home"
  });
});

//
// Donate Redirect
//
app.get('/donate', function (req, res) {
  res.redirect(`${config.donatelink}`);
});

//
// Apply
//
app.get('/apply', function (req, res) {
  res.render('apply', {
    "servername": `${config.servername}`,
    "sitecolour": `${config.sitecolour}`,
    "email": `${config.email}`,
    "pagetitle": "Apply"
  });
});

app.post('/apply', urlencodedParser, function (req, res) {
  try {
    let whitelistappschannel = client.channels.find(c => c.name === 'whitelist-apps');
    if (!whitelistappschannel) return console.log('A #whitelist-apps channel does not exist.');

    var embed = new Discord.RichEmbed()
      .setTitle(`New Whitelist Application [${req.body.minecraftUsernameselector}]`)
      .addField(`Username`, `${req.body.minecraftUsernameselector}`, true)
      .addField(`Discord Tag`, `${req.body.discordtagselector}`, true)
      .addField(`How did you hear about us`, `${req.body.howdidyouhearaboutusselector}`)
      .addField(`Any additional information`, `${req.body.additionalinformationselector}`)
      .setColor('#99ddff')
    whitelistappschannel.send(embed);
    console.log(chalk.yellow('[CONSOLE] ') + chalk.blue('[DISCORD] ') + `Whitelist Request for ${req.body.minecraftUsernameselector} has been sent.`);

    res.redirect('/');
  } catch {
    console.log('An error occured');
  }
});

//
// Report
//
app.get('/report', function (req, res) {
  res.render('report', {
    "servername": `${config.servername}`,
    "sitecolour": `${config.sitecolour}`,
    "email": `${config.email}`,
    "pagetitle": "Report a Player"
  });
});

app.post('/report', urlencodedParser, function (req, res) {
  try {
    let reportschannel = client.channels.find(c => c.name === 'reports');
    if (!reportschannel) return console.log('A #reports channel does not exist.');

    var embed = new Discord.RichEmbed()
      .setTitle(`New Player Report [${req.body.reporteduserselector}]`, true)
      .addField(`Reporters Username`, `${req.body.reporteruserselector}`, true)
      .addField(`Reporters Discord Tag`, `${req.body.discordtagselector}`, true)
      .addField(`Reported Players Username`, `${req.body.reporteduserselector}`, true)
      .addField(`Evidence & Reasoning`, `${req.body.evidenceselector}`)
      .setColor('#ffa366')
    reportschannel.send(embed);
    console.log(chalk.yellow('[CONSOLE] ') + chalk.cyan('[DISCORD] ') + `Successfully sent Report on ${req.body.reporteduserselector}.`);

    res.redirect('/');
  } catch {
    console.log('An error occured');
  }
});

//
// Discord Server Redirect
//
app.get('/discord', function (req, res) {
  res.redirect(`${config.discordlink}`);
});

//
// GitHub Issue Tracker Redirect
//
app.get('/issues', function (req, res) {
  res.redirect(`${config.githubissuetrackerlink}`);
});

//
// Rules
//
app.get('/rules', function (req, res) {
  res.render('rules', {
    "servername": `${config.servername}`,
    "sitecolour": `${config.sitecolour}`,
    "email": `${config.email}`,
    "pagetitle": "Rules",
    rulesmd: config.rulesmd
  });
});

//
// Development [plugin]
//
app.get('/development/plugin', function (req, res) {
  var options = {
    url: 'https://api.github.com/repos/shadowolfyt/zander/commits',
    headers: { 'User-Agent': 'request' }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      res.redirect('/');
      res.render('development-plugin', {
        "servername": `${config.servername}`,
        "sitecolour": `${config.sitecolour}`,
        "email": `${config.email}`,
        "pagetitle": "Plugin Development Log",
        objdata: info
      });
    };
  };
  request(options, callback);
});

//
// Development [web]
//
app.get('/development/web', function (req, res) {
  var options = {
    url: 'https://api.github.com/repos/shadowolfyt/zander-web/commits',
    headers: { 'User-Agent': 'request' }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      res.render('development-web', {
        "servername": `${config.servername}`,
        "sitecolour": `${config.sitecolour}`,
        "email": `${config.email}`,
        "pagetitle": "Web Development Log",
        objdata: info
      });
    };
  };
  request(options, callback);
});

//
// Players
//
app.get('/players', function (req, res) {
  connection.query (`SELECT * FROM playerdata; select pd.username as 'username', count(ses.id) as 'joins' from sessions ses left join playerdata pd on pd.id = ses.player_id group by pd.username;`, function (error, results, fields) {
    if (error) {
      res.redirect('/');
      throw error;
    } else {
      res.render('players', {
        "servername": `${config.servername}`,
        "sitecolour": `${config.sitecolour}`,
        "email": `${config.email}`,
        "pagetitle": "Players",
        objdata: results
      });
    }
    console.log(results[0]);
    console.log(results[1]);
  });
});

//
// Punishments
//
app.get('/punishments', function (req, res) {
  let sql = `SELECT * FROM punishments ORDER BY id DESC`;
  connection.query (sql, function (err, result) {
    if (err) {
      res.redirect('/');
      throw err;
    } else {
      res.render('punishments', {
        "servername": `${config.servername}`,
        "sitecolour": `${config.sitecolour}`,
        "email": `${config.email}`,
        "pagetitle": "Punishments",
        objdata: result
      });
    }
  });
});

//
// Profile
//
app.get('/profile/:username', function (req, res) {
  let sql = `SELECT * FROM playerdata WHERE username='${req.params.username}'`;
  connection.query (sql, function (err, result) {
    if (err) {
      res.redirect('/');
      throw err;
    } else {
      res.render('profile', {
        "servername": `${config.servername}`,
        "sitecolour": `${config.sitecolour}`,
        "email": `${config.email}`,
        "pagetitle": `${req.params.username}'s Profile`,
        objdata: result
      });
    }
  });
});

//
// Application Boot
//
app.listen(process.env.PORT || config.applicationlistenport, function() {
  console.log(chalk.yellow(`\n// zander-web v.${package.version}\n`) + chalk.cyan(`GitHub Repository: ${package.homepage}\nCreated By: ${package.author}`));
  console.log(chalk.yellow('[CONSOLE] ' ) + 'Application is listening to the port ' + process.env.PORT || config.applicationlistenport);

  client.login(process.env.token || credentials.token);
  console.log(chalk.yellow('[CONSOLE] ' ) + chalk.blue('[DISCORD] ') + 'Launched Discord web-side.');
});
