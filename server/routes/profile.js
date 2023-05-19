const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/user');

function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).send({ message: 'Nicht autorisiert' });
}

router.get('/', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/views/profil.html'));
});

router.get('/info', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(401).send({ message: 'Benutzer nicht gefunden' });
    }
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Etwas ist schief gelaufen: ${err.message}` });
  }
});

router.post('/info', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).send({ message: 'Benutzer nicht gefunden' });
    }
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.birthdate = req.body.birthdate;
    user.gender = req.body.gender;
    user.medicalConditions = req.body.medicalConditions;
    user.emergencyContact = req.body.emergencyContact;

    await user.save();
    res.send({ message: 'Profilinformationen erfolgreich geändert' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: `Etwas ist schief gelaufen: ${err.message}` });
  }
});

module.exports = router;