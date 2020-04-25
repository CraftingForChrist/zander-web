const express = require('express');
const router = express.Router();
const config = require('../../../config.json');
const database = require('../../../controllers/database.js');

router.get('/', (req, res, next) => {
  if (req.session.user) {
    database.query(`SELECT * FROM servers ORDER BY position ASC;`, function (error, results, fields) {
      if (error) {
        res.redirect('/');
        throw error;
      } else {
        res.render('admin/servers/list', {
          "pagetitle": "Administration Panel - Servers",
          objdata: results
        });
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

router.post('/', function (req, res) {
  if (req.session.user) {
    const action = req.body.action;
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    const disclaimer = req.body.disclaimer;
    const ipaddress = req.body.ipaddress;
    const position = req.body.position;

    if (action == 'edit') {
      database.query(`SELECT * FROM servers WHERE id = ?`, [id], function (error, results, fields) {
        if (error) {
          res.redirect('/');
          throw error;
        } else {
          res.render('admin/servers/edit', {
            "pagetitle": `Administration Panel - Server Instance Editing`,
            objdata: results[0]
          });
        };
      });
    }
  } else {
    res.render('session/login', {
      setValue: true,
      message: 'You cannot access this page unless you are logged in.',
      "pagetitle": "Login"
    });
  }
});

module.exports = router;
