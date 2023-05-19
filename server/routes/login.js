const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/views/anmelden.html'));
});

router.post('/', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    req.session.userId = user._id;
    res.redirect('/profil');
  } else {
    res.send('Falsche Anmeldeinformationen');
  }
});

module.exports = router;