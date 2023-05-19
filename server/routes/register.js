const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/views/registrieren.html'));
});

router.post('/', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send('Ein Benutzer mit dieser E-Mail existiert bereits');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    const savedUser = await user.save();
    req.session.userId = savedUser._id;
    res.redirect('/profil');
  } catch (err) {
    console.error(err);
    res.status(500).send(`Etwas ist schief gelaufen: ${err.message}`);
  }
});

module.exports = router;