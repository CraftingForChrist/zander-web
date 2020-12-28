const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  if (req.session.playerid && req.session.permissions.administrationpanel == 1) {
    res.render('admin/dashboard', {
      "pagetitle": "Administration Panel"
    });
  } else {
    res.render('session/login', {
      erroralert: true,
      message: 'You do not have permission to access this page.',
      "pagetitle": "Login"
    });
  }
});

router.post('/', function (req, res) {
  if (req.session.playerid && req.session.permissions.administrationpanel == 1) {

  } else {
    res.render('session/login', {
      setValue: true,
      message: 'You do not have permission to access this page.',
      pagetitle: "Login"
    });
  };
});

module.exports = router;
