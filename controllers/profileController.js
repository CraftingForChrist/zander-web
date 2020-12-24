const database = require('./database'); // zander Database controller
const lpdatabase = require('./lpdatabase'); // LuckPerms Database controller
const abdatabase = require('./abdatabase'); // AdvancedBan Database controller
const config = require('../config.json');
const HexColour = require('../HexColour.json');
const fetch = require('node-fetch');

//
// Profile
// GET
//
module.exports.profile_get = (req, res) => {
  // Query the database for the players data and online status.
  let sql = `select sessionend, sessionstart, uuid, username, joined, server,
  (IF(
  		(select gamesessions.id from gamesessions left join playerdata pd on pd.id = gamesessions.playerid
          where gamesessions.sessionstart <= NOW() and gamesessions.sessionend is NULL and pd.username=?
      ), 'Online', 'Offline'))  as 'status'
  from gamesessions, playerdata where playerid = playerdata.id and playerdata.username=? order by sessionstart desc limit 1;
  select * from playerprofile where playerid=(select id from playerdata where username=?);`

  database.query(sql, [req.params.username, req.params.username, req.params.username], async function (err, zanderplayerresults) {
    const playerresults = zanderplayerresults[0][0];
    const playerprofileresults = zanderplayerresults[1][0];

    console.log("======================");
    console.log(playerprofileresults.twitter);
    console.log("======================");

    // If there is no player of that username, send them the Player Not Found screen.
    if (typeof (playerresults) == "undefined") {
      res.render('errorviews/playernotfound', {
        "pagetitle": "Player Not Found"
      });
      return
    } else {
      if (playerresults.username.includes("*")) {
        bedrockuser = true;
      } else {
        bedrockuser = false;
      };
    }

    // Get the players Mixed TGM statistics to display.
    let response = await fetch(`${process.env.tgmapiurl}/mc/player/${playerresults.username}?simple=true`);
    let tgmbodyres = await response.json();

    if (tgmbodyres.user.xp <= '0') {
      tgmresbool = false;
    } else {
      tgmresbool = true;
    };

    if (zanderplayerresults[0].username == req.session.username) {
      isProfileUser = true;
    } else {
      isProfileUser = true;
    };

    profileeditmode = false;

    const killdeathratio = tgmbodyres.user.kills !== 0 && tgmbodyres.user.deaths !== 0 ? (tgmbodyres.user.kills / tgmbodyres.user.deaths).toFixed(2) : 'None';
    const winlossratio = (tgmbodyres.user.wins / tgmbodyres.user.losses).toFixed(2);

    // Formatting the initial join date and putting it into template.
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const initjoin = playerresults.joined;
    const initjoindate = `${initjoin.getDay()} ${months[initjoin.getMonth()]} ${initjoin.getFullYear()}`;

    if (err) {
      res.render('errorviews/500', {
        "pagetitle": "500: Internal Server Error"
      });
      return;
      throw err;
    } else {
      const reqplayeruuid = playerresults.uuid.replace(/-/g, '');

      // Query the database for the players data and online status.
      let sql = `select id, name, reason, operator, punishmentType from punishmenthistory where uuid=?;`

      abdatabase.query(sql, [reqplayeruuid], async function (err, punishmentresults) {
        if (err) {
          res.render('errorviews/500', {
            "pagetitle": "500: Internal Server Error"
          });
          return;
          throw err;
        } else {
          // Query the database for the players data and online status.
          let sql = `select permission from luckperms_user_permissions where uuid=?;`
          lpdatabase.query(sql, [playerresults.uuid], async function (err, playerrankresults) {
            if (err) {
              res.render('errorviews/500', {
                "pagetitle": "500: Internal Server Error"
              });
              return;
              throw err;
            } else {
              playerrankresults.forEach(function (data) {
                console.log(data.permission);
              });

              res.render('profile', {
                "pagetitle": `${playerresults.username}'s Profile`,
                playerresults: playerresults,
                playerprofileresults: playerprofileresults,
                punishmentresults: punishmentresults,
                playerrankresults: playerrankresults,
                HexColour: HexColour,
                tgmres: tgmbodyres,
                tgmresbool: tgmresbool,
                profileeditmode: profileeditmode,
                isProfileUser: isProfileUser,
                bedrockuser: bedrockuser,
                currentserver: capitalizeFirstLetter(playerresults.server),
                initjoindate: initjoindate,
                killdeathratio: killdeathratio,
                winlossratio: winlossratio
              });
            }
          });
        }
      });
    }
  });

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};

//
// Profile Edit
// GET
//
module.exports.profileedit_get = (req, res) => {
  if (req.session.playerid || req.session.permission.profileedit == 1 || isProfileUser == true) {
    // Query the database for the players data and online status.
    let sql = `select sessionend, sessionstart, uuid, username, joined, server,
    (IF(
        (select gamesessions.id from gamesessions left join playerdata pd on pd.id = gamesessions.playerid
            where gamesessions.sessionstart <= NOW() and gamesessions.sessionend is NULL and pd.username=?
        ), 'Online', 'Offline'))  as 'status'
    from gamesessions, playerdata where playerid = playerdata.id and playerdata.username=? order by sessionstart desc limit 1;
    select * from playerprofile where playerid=(select id from playerdata where username=?);`
  
    database.query(sql, [req.params.username, req.params.username, req.params.username], async function (err, zanderplayerresults) {
      const playerresults = zanderplayerresults[0][0];
      const playerprofileresults = zanderplayerresults[1][0];
  
      console.log("======================");
      console.log(playerprofileresults.twitter);
      console.log("======================");
  
      // If there is no player of that username, send them the Player Not Found screen.
      if (typeof (playerresults) == "undefined") {
        res.render('errorviews/playernotfound', {
          "pagetitle": "Player Not Found"
        });
        return
      } else {
        if (playerresults.username.includes("*")) {
          bedrockuser = true;
        } else {
          bedrockuser = false;
        };
      }
  
      // Get the players Mixed TGM statistics to display.
      let response = await fetch(`${process.env.tgmapiurl}/mc/player/${playerresults.username}?simple=true`);
      let tgmbodyres = await response.json();
  
      if (tgmbodyres.user.xp <= '0') {
        tgmresbool = false;
      } else {
        tgmresbool = true;
      };
  
      if (playerresults.username == req.session.username) {
        isProfileUser = true;
      } else {
        isProfileUser = true;
      };

      profileeditmode = true;
  
      const killdeathratio = tgmbodyres.user.kills !== 0 && tgmbodyres.user.deaths !== 0 ? (tgmbodyres.user.kills / tgmbodyres.user.deaths).toFixed(2) : 'None';
      const winlossratio = (tgmbodyres.user.wins / tgmbodyres.user.losses).toFixed(2);
  
      // Formatting the initial join date and putting it into template.
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const initjoin = playerresults.joined;
      const initjoindate = `${initjoin.getDay()} ${months[initjoin.getMonth()]} ${initjoin.getFullYear()}`;
  
      if (err) {
        res.render('errorviews/500', {
          "pagetitle": "500: Internal Server Error"
        });
        return;
        throw err;
      } else {
        const reqplayeruuid = playerresults.uuid.replace(/-/g, '');
  
        // Query the database for the players data and online status.
        let sql = `select id, name, reason, operator, punishmentType from punishmenthistory where uuid=?;`
  
        abdatabase.query(sql, [reqplayeruuid], async function (err, punishmentresults) {
          if (err) {
            res.render('errorviews/500', {
              "pagetitle": "500: Internal Server Error"
            });
            return;
            throw err;
          } else {
            // Query the database for the players data and online status.
            let sql = `select permission from luckperms_user_permissions where uuid=?;`
            lpdatabase.query(sql, [playerresults.uuid], async function (err, playerrankresults) {
              if (err) {
                res.render('errorviews/500', {
                  "pagetitle": "500: Internal Server Error"
                });
                return;
                throw err;
              } else {
                playerrankresults.forEach(function (data) {
                  console.log(data.permission);
                });
  
                res.render('profile', {
                  "pagetitle": `${playerresults.username}'s Profile`,
                  playerresults: playerresults,
                  playerprofileresults: playerprofileresults,
                  punishmentresults: punishmentresults,
                  playerrankresults: playerrankresults,
                  HexColour: HexColour,
                  tgmres: tgmbodyres,
                  tgmresbool: tgmresbool,
                  isProfileUser: isProfileUser,
                  profileeditmode: profileeditmode,
                  bedrockuser: bedrockuser,
                  currentserver: capitalizeFirstLetter(playerresults.server),
                  initjoindate: initjoindate,
                  killdeathratio: killdeathratio,
                  winlossratio: winlossratio
                });
              }
            });
          }
        });
      }
    });
  
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  } else {
    res.redirect('/');
  }
};

//
// Profile Edit
// POST
//
module.exports.profileedit_post = (req, res) => {
  console.log(req.body);

  const interests = req.body.interests;
  const twitter = req.body.twitter;
  const youtube = req.body.youtube;
  const instagram = req.body.instagram;
  const steam = req.body.steam;
  const github = req.body.github;
  const snapchat = req.body.snapchat;
  const discord = req.body.interests;
  // const coverart = req.body.coverart;
  // const aboutpage = req.body.aboutpage;

  // coverart=? aboutpage=?
  let sql = `UPDATE playerprofile interests=?, twitter=?, twitch=?, youtube=?, instagram=?, steam=?, github=?, snapchat=?, discord=? where playerid = (select id from playerdata where username=?);`
  
    database.query(sql, [interests, twitter, youtube, instagram, steam, github, snapchat, discord, req.params.username], async function (err, results) {
      res.redirect("/profile/" + req.params.username);
    });
};