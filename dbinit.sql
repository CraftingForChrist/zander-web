DROP DATABASE IF EXISTS zander;
CREATE DATABASE IF NOT EXISTS zander;
USE zander;

-- CREATE USER 'zander'@'%' IDENTIFIED WITH mysql_native_password BY 'Passwordzander321';
-- FLUSH PRIVILEGES;
-- GRANT SELECT ON zander.* TO zander@'%';
-- GRANT INSERT ON zander.* TO zander@'%';
-- GRANT UPDATE ON zander.* TO zander@'%';
-- GRANT DELETE ON zander.* TO zander@'%';

CREATE TABLE playerdata (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  uuid VARCHAR(36),
  username VARCHAR(16),
  joined TIMESTAMP NOT NULL DEFAULT NOW()
);
create index playerdata_username on playerdata (username);
-- INSERT INTO playerdata (uuid, username) VALUES ('f78a4d8d-d51b-4b39-98a3-230f2de0c670', 'CONSOLE');

CREATE TABLE playerprofile (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  playerid INT NOT NULL DEFAULT 0,
  interests TEXT DEFAULT NULL,
  twitter VARCHAR(16) DEFAULT NULL,
  twitch VARCHAR(26) DEFAULT NULL,
  youtube TEXT DEFAULT NULL,
  instagram VARCHAR(32) DEFAULT NULL,
  steam VARCHAR(32) DEFAULT NULL,
  github VARCHAR(40) DEFAULT NULL,
  snapchat VARCHAR(30) DEFAULT NULL,
  discord VARCHAR(18) DEFAULT NULL,
  coverart TEXT DEFAULT NULL,
  aboutpage TEXT DEFAULT NULL,
  FOREIGN KEY (playerid) REFERENCES playerdata (id)
);

CREATE TABLE gamesessions (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  playerid INT NOT NULL DEFAULT 0,
  sessionstart TIMESTAMP NOT NULL DEFAULT NOW(),
  sessionend TIMESTAMP NULL,
  ipaddress VARCHAR(45),
  server VARCHAR(50),
  FOREIGN KEY (playerid) REFERENCES playerdata (id)
);
create index gamesessions_playerid on gamesessions (playerid);
create index gamesessions_sessionstart on gamesessions (sessionstart);
create index gamesessions_sessionend on gamesessions (sessionend);

CREATE TABLE gamepunishments (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  playerid INT NOT NULL DEFAULT 0,
  staffid INT NOT NULL DEFAULT 0,
  type TEXT,
  reason TEXT,
  createdat TIMESTAMP NOT NULL DEFAULT NOW(),
  expires DATETIME,
  appealed BOOLEAN DEFAULT 0,
  FOREIGN KEY (playerid) REFERENCES playerdata (id),
  FOREIGN KEY (staffid) REFERENCES playerdata (id)
);

CREATE TABLE discordpunishments (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  playerid INT NOT NULL DEFAULT 0,
  staffid INT NOT NULL DEFAULT 0,
  type TEXT,
  reason TEXT,
  createdat TIMESTAMP NOT NULL DEFAULT NOW(),
  expires DATETIME,
  appealed BOOLEAN DEFAULT 0,
  FOREIGN KEY (playerid) REFERENCES playerdata (id),
  FOREIGN KEY (staffid) REFERENCES playerdata (id)
);

CREATE TABLE webaccounts (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  playerid INT NOT NULL DEFAULT 0,
  email VARCHAR(200),
  password TEXT,
  registrationtoken VARCHAR(32),
  registered BOOLEAN DEFAULT 0,
  disabled BOOLEAN DEFAULT 0,
  FOREIGN KEY (playerid) REFERENCES playerdata (id)
);

CREATE TABLE webpermissions (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  playerid INT NOT NULL DEFAULT 0,

  profileedit BOOLEAN DEFAULT 0,
  administrationpanel BOOLEAN DEFAULT 0,

  eventadd BOOLEAN DEFAULT 0,
  eventedit BOOLEAN DEFAULT 0,
  eventremove BOOLEAN DEFAULT 0,

  serveradd BOOLEAN DEFAULT 0,
  serveredit BOOLEAN DEFAULT 0,
  serverremove BOOLEAN DEFAULT 0,

  stafftitleadd BOOLEAN DEFAULT 0,
  stafftitleedit BOOLEAN DEFAULT 0,
  stafftitleremove BOOLEAN DEFAULT 0,

  punishmentissuewarn BOOLEAN DEFAULT 0,
  punishmentissuekick BOOLEAN DEFAULT 0,
  punishmentissuetempban BOOLEAN DEFAULT 0,
  punishmentissueban BOOLEAN DEFAULT 0,

  punishmentissuewebwarn BOOLEAN DEFAULT 0,
  punishmentissuewebkick BOOLEAN DEFAULT 0,
  punishmentissuewebtempban BOOLEAN DEFAULT 0,
  punishmentissuewebban BOOLEAN DEFAULT 0,
  punishmentissuewebdisable BOOLEAN DEFAULT 0,

  punishmentissuediscordwarn BOOLEAN DEFAULT 0,
  punishmentissuediscordkick BOOLEAN DEFAULT 0,
  punishmentissuediscordtempban BOOLEAN DEFAULT 0,
  punishmentissuediscordban BOOLEAN DEFAULT 0,

  punishmentedit BOOLEAN DEFAULT 0,
  punishmentremove BOOLEAN DEFAULT 0,

  appealopen BOOLEAN DEFAULT 0,
  appealclose BOOLEAN DEFAULT 0,
  appealappeal BOOLEAN DEFAULT 0,
  appeallock BOOLEAN DEFAULT 0,
  appealstaffnote BOOLEAN DEFAULT 0,
  appealescalate BOOLEAN DEFAULT 0,

  FOREIGN KEY (playerid) REFERENCES playerdata (id)
);

CREATE TABLE events (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  title TEXT,
  icon TEXT,
  eventdatetime DATETIME,
  information TEXT
);

CREATE TABLE servers (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  name TEXT,
  icon VARCHAR(100),
  description TEXT,
  disclaimer TEXT,
  ipaddress TEXT,
  position VARCHAR(2),
  visable BOOLEAN DEFAULT 1,
  playersonline TEXT
);

CREATE TABLE ccstreams (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  playerid INT NOT NULL DEFAULT 0,
  channel TEXT,
  viewcount VARCHAR(10),
  status BOOLEAN,
  FOREIGN KEY (playerid) REFERENCES playerdata (id)
);

CREATE TABLE ccvideos (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  playerid INT NOT NULL DEFAULT 0,
  channelid TEXT,
  FOREIGN KEY (playerid) REFERENCES playerdata (id)
);

CREATE TABLE votes (
  id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  username VARCHAR(16),
  service TEXT,
  time TIMESTAMP NOT NULL DEFAULT NOW()
);

--
--
--
--

-- CREATE TABLE announcements (
--   id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
--   body TEXT,
--   -- motd BOOLEAN,
--   ingame BOOLEAN,
--   web BOOLEAN,
--   createdate DATETIME,
--   enabled BOOLEAN
-- );

-- CREATE TABLE appeals (
--   id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
--   playerid INT NOT NULL DEFAULT 0,
--   punishmentid INT NOT NULL DEFAULT 0,
--   open BOOLEAN,
--   locked BOOLEAN,
--   appealed BOOLEAN,
--   escalated BOOLEAN,
--   createdate TIMESTAMP NOT NULL DEFAULT NOW(),
--   updatedate DATETIME,
--   FOREIGN KEY (playerid) REFERENCES playerdata (id)
-- );

-- CREATE TABLE slides (
--   id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
--   slideenable BOOLEAN DEFAULT 1,

--   titleenable BOOLEAN DEFAULT 1,
--   title VARCHAR(100),
  
--   imageref VARCHAR(50),
  
--   descriptionenable BOOLEAN DEFAULT 1,
--   description VARCHAR(200),
  
--   buttonlinkrefenable BOOLEAN DEFAULT 1,
--   buttonlinkreftype VARCHAR(50),
--   buttonlinkref VARCHAR(100)
-- );