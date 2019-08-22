//
// Project Constants
//
const express = require('express');
const session = require('express-session');
require ('dotenv').config();
const fs = require('fs');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const mysql = require('mysql');
const ejs = require('ejs');
const request = require('request');
const cookieparser = require('cookie-parser');
const passport = require('passport');
const mysqlstore = require('express-mysql-session')(session);
const Discord = require('discord.js');
const client = new Discord.Client({ disableEveryone: true });
client.commands = new Discord.Collection();
const nodemailer = require('nodemailer');
const inlinecss = require('nodemailer-juice');
const flash = require('express-flash');

//
// File Constants
//
const package = require('./package.json');
const config = require('./config.json');

//
// Controllers
//
const database = require('./controllers/database.js');
const transporter = require('./controllers/mail.js');

//
// Constants
//
const app = express();
var obj = {};

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieparser());
app.use(flash());

//
// Session Management
//
var options = {
  host: process.env.dbhost,
  user: process.env.dbuser,
  password: process.env.dbpassword,
  database: process.env.dbname,
  multipleStatements: true
};
const sessionstore = new mysqlstore(options);

app.use(session({
  secret: process.env.sessionsecret,
  resave: false,
  saveUninitialized: false,
  store: sessionstore,
  // cookie: {
  //   secure: true
  // }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

//
// Site Routes
//
var index = require('./routes/index');

var terms = require('./routes/policy/terms');
var privacy = require('./routes/policy/privacy');
var rules = require('./routes/policy/rules');
var discord = require('./routes/redirect/discord');
var issues = require('./routes/redirect/issues');
var support = require('./routes/redirect/support');

var apply = require('./routes/apply/apply');
var applygame = require('./routes/apply/apply-game')(client);
var applycreator = require('./routes/apply/apply-creator')(client);
var applydeveloper = require('./routes/apply/apply-developer')(client);

var report = require('./routes/report')(client);
var contact = require('./routes/contact');
var feedback = require('./routes/feedback');

var discord = require('./routes/redirect/discord');
var issues = require('./routes/redirect/issues');
var support = require('./routes/redirect/support');

var login = require('./routes/sessions/login');
var logout = require('./routes/sessions/logout');
var register = require('./routes/sessions/register');

var admin = require('./routes/admin/admin');

// var forums = require('./routes/forums');


app.use('/', index);

app.use('/terms', terms);
app.use('/privacy', privacy);
app.use('/rules', rules);

app.use('/apply', apply);
app.use('/apply/game', applygame);
app.use('/apply/creator', applycreator);
app.use('/apply/developer', applydeveloper);

app.use('/report', report);
app.use('/contact', contact);
app.use('/feedback', feedback);


app.use('/discord', discord);
app.use('/issues', issues);
app.use('/support', support);

app.use('/login', login);
app.use('/logout', logout);
app.use('/register', register);

app.use('/admin', admin);

//
// Feedback
//
app.post('/feedback', function (req, res) {
  try {
    if (config.discordsend == true) {
      //
      // Discord Notification Send
      // Requires a #enquiries channel to be created.
      //
      let enquirieschannel = client.channels.find(c => c.name === 'enquiries');
      if (!enquirieschannel) return console.log('A #feedback channel does not exist.');

      var embed = new Discord.RichEmbed()
        .setTitle(`Feedback`)
        .addField(`Username`, `${req.body.minecraftusernameselector}`, true)
        .addField(`What type of feedback would you like to provide?`, `${req.body.feedbacktypeselector}`, true)
        .addField(`Please provide detail on your feedback.`, `${req.body.detailfeedbackselector}`)
        .setColor('#79ff4d')
      enquirieschannel.send(embed);
      console.log(chalk.yellow('[CONSOLE] ') + chalk.blue('[DISCORD] ') + `Feedback has been sent.`);
    };

    if (config.mailsend == true) {
      //
      // Mail Send
      // Requires a email to be in the notificationemail field.
      //
      ejs.renderFile(__dirname + "/views/email/feedback.ejs", {
        subject: `[Feedback] ${req.body.feedbacktype}`,
        username: req.body.minecraftusernameselector,
        feedbacktype: req.body.feedbacktypeselector,
        detailfeedback: req.body.detailfeedbackselector
      }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: process.env.serviceauthuser,
                to: config.notificationemail,
                subject: `[Feedback] ${req.body.feedbacktypeselector}`,
                html: data
            };

            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
        }
      });
    }

    res.redirect('/');
  } catch (error) {
    console.log('An error occured');
    console.log(error);
  }
});

//
// Development [plugin]
//
// app.get('/development/plugin', function (req, res) {
//   var options = {
//     url: config.developmentplugindevlink,
//     headers: { 'User-Agent': 'request' }
//   };
//
//   function callback(error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var info = JSON.parse(body);
//       res.redirect('/');
//       res.render('development-plugin', {
//         "servername": `${config.servername}`,
//         "sitecolour": `${config.sitecolour}`,
//         "email": `${config.email}`,
//         "pagetitle": "Plugin Development Log",
//         objdata: info
//       });
//     };
//   };
//   request(options, callback);
// });

//
// Development [web]
//
// app.get('/development/web', function (req, res) {
//   var options = {
//     url: config.developmentwebdevlink,
//     headers: { 'User-Agent': 'request' }
//   };
//
//   function callback(error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var info = JSON.parse(body);
//       res.render('development-web', {
//         "servername": `${config.servername}`,
//         "sitecolour": `${config.sitecolour}`,
//         "email": `${config.email}`,
//         "pagetitle": "Web Development Log",
//         objdata: info
//       });
//     };
//   };
//   request(options, callback);
// });

//
// Players
//
app.get('/players', function (req, res) {
  connection.query (`SELECT * FROM playerdata; SELECT pd.username as 'username', COUNT(ses.id) as 'joins' FROM sessions ses left join playerdata pd on pd.id = ses.player_id group by pd.username;`, function (error, results, fields) {
    if (error) {
      res.redirect('/');
      throw error;
    } else {
      res.render('players', {
        "servername": `${config.servername}`,
        "sitecolour": `${config.sitecolour}`,
        "email": `${config.email}`,
        "serverip": `${config.serverip}`,
        "website": `${config.website}`,
        "description": `${config.description}`,
        "weblogo": `${config.weblogo}`,
        "webfavicon": `${config.webfavicon}`,
        "pagetitle": "Players",
        objdata: results
      });
      console.log(results);
    }
  });
});

//
// Punishments
//
app.get('/punishments', function (req, res) {
  let sql = `select p.id as 'id', p.punishtimestamp as 'timestamp', punisher.username as 'punisher', punisher.uuid as 'punisheruuid', punished.username as 'punished', punished.uuid as 'punisheduuid', p.punishtype as 'punishtype', p.reason as 'reason' from punishments p left join playerdata punished on punished.id = p.punisheduser_id left join playerdata punisher on punisher.id = p.punisher_id ORDER BY id ASC;`;
  connection.query (sql, function (err, results) {
    if (err) {
      res.redirect('/');
      throw err;
    } else {
      res.render('punishments', {
        "servername": `${config.servername}`,
        "sitecolour": `${config.sitecolour}`,
        "email": `${config.email}`,
        "serverip": `${config.serverip}`,
        "website": `${config.website}`,
        "description": `${config.description}`,
        "weblogo": `${config.weblogo}`,
        "webfavicon": `${config.webfavicon}`,
        "pagetitle": "Punishments",
        objdata: results
      });
      // console.log(results);
    }
  });
});

//
// Profile
//
app.get('/profile/:username', function (req, res) {
  let sql = `SELECT * FROM playerdata WHERE username='${req.params.username}'; select if((select ses.id from sessions ses left join playerdata pd on pd.id = ses.player_id where ses.sessionstart <= NOW() and sessionend is NULL and pd.username = '${req.params.username}'), 'Online', 'Offline') as 'status'; select SEC_TO_TIME(sum(TIME_TO_SEC(timediff(ses.sessionend, ses.sessionstart)))) as 'timeplayed' from sessions ses left join playerdata pd on pd.id = ses.player_id where pd.username = '${req.params.username}'; SELECT count(ses.id) as 'joins' from sessions ses left join playerdata pd on pd.id = ses.player_id where pd.username = '${req.params.username}'; select p.username, timediff(lp.lp_timestamp, NOW()) as 'lastseen' from (select ses.player_id, greatest(max(ses.sessionend), max(ses.sessionstart)) as 'lp_timestamp' from sessions ses group by ses.player_id) as lp left join playerdata p on p.id = lp.player_id where username = '${req.params.username}';`;
  connection.query (sql, function (err, results) {
    if (err) {
      res.redirect('/');
      throw err;
    } else {
      res.render('profile', {
        "servername": `${config.servername}`,
        "sitecolour": `${config.sitecolour}`,
        "email": `${config.email}`,
        "serverip": `${config.serverip}`,
        "website": `${config.website}`,
        "description": `${config.description}`,
        "weblogo": `${config.weblogo}`,
        "webfavicon": `${config.webfavicon}`,
        "pagetitle": `${req.params.username}'s Profile`,
        objdata: results
      });
    }
  });
});

//
// Contact
//
app.post('/contact', function (req, res) {
  try {
    if (config.discordsend == true) {
      //
      // Discord Notification Send
      // Requires a #enquiries channel to be created.
      //
      let enquirieschannel = client.channels.find(c => c.name === 'enquiries');
      if (!enquirieschannel) return console.log('A #enquiries channel does not exist.');

      var embed = new Discord.RichEmbed()
        .setTitle(`New Contact Enquiry`)
        .addField(`Username/Name`, `${req.body.name}`, true)
        .addField(`Email`, `${req.body.email}`, true)
        .addField(`Subject`, `${req.body.subject}`)
        .addField(`Message`, `${req.body.message}`)
        .setColor('#86b300')
      enquirieschannel.send(embed);
      console.log(chalk.yellow('[CONSOLE] ') + chalk.blue('[DISCORD] ') + `Enquiry has been sent.`);
    };

    if (config.mailsend == true) {
      //
      // Mail Send
      // Requires a email to be in the notificationemail field.
      //
      ejs.renderFile(__dirname + "/views/email/enquiry.ejs", {
        subject: `[Enquiry] ${req.body.subject}`,
        nameselector: req.body.name,
        emailselector: req.body.email,
        subjectselector: req.body.subject,
        messageselector: req.body.message
      }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: process.env.serviceauthuser,
                to: config.notificationemail,
                subject: `[Enquiry] ${req.body.subject}`,
                html: data
            };

            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
        }
      });
    }
    res.redirect('/');
  } catch (error) {
    console.log('An error occured');
    console.log(error);
  }
});

//
// About
//
// app.get('/about', function (req, res) {
//   res.render('about', {
//     "servername": `${config.servername}`,
//     "sitecolour": `${config.sitecolour}`,
//     "email": `${config.email}`,
//     "serverip": `${config.serverip}`,
//     "website": `${config.website}`,
//     "description": `${config.description}`,
//     "weblogo": `${config.weblogo}`,
//     "webfavicon": `${config.webfavicon}`,
//     "pagetitle": "About"
//   });
// });

//
// Discord Commands & Integration
//
// Reads all commands & boot them in.
fs.readdir('./discord/commands', (err, files) => {
  if (err) console.log(err);
  let jsfile = files.filter(f => f.split(".").pop() === 'js')
  if (jsfile.length <= 0) {
    console.log(chalk.red('Couldn\'t find commands.'));
    return
  }

  jsfile.forEach((files, i) => {
    let props = require(`./discord/commands/${files}`);
    console.log(chalk.yellow('[CONSOLE] ' ) + chalk.blue('[DISCORD] ') + chalk.yellow(files) + ` has been loaded.`);
    client.commands.set(props.help.name, props);
  })
});

client.on("message", (message) => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  let prefix = '!';
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if (!cmd.startsWith(prefix)) return;
  let commandfile = client.commands.get(cmd.slice(prefix.length));
  if (commandfile) commandfile.run(client, message, args);
});

//
// Application Boot
//
app.listen(process.env.PORT || config.applicationlistenport, function() {
  console.log(chalk.yellow(`\n// zander-web v.${package.version}\n`) + chalk.cyan(`GitHub Repository: ${package.homepage}\nCreated By: ${package.author}`));
  console.log(chalk.yellow('[CONSOLE] ' ) + 'Application is listening to the port ' + process.env.PORT || config.applicationlistenport);

  client.login(process.env.token);

  client.on("ready", () => {
    console.log(chalk.yellow('[CONSOLE] ' ) + chalk.blue('[DISCORD] ') + 'Launched Discord web-side.');
  });
});
