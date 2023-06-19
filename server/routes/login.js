// Wir holen uns die Werkzeuge, die wir brauchen. Dazu gehören express für die Routen,
// path um Pfade zu finden, bcrypt um Passwörter zu vergleichen und unser User-Modell.
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Wenn jemand die Anmeldeseite aufruft, senden wir ihm die Anmeldeseite.
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/views/anmelden.html'));
});

// Wenn jemand versucht sich anzumelden, prüfen wir seine Anmeldeinformationen.
router.post('/', async (req, res) => {
  // Wir suchen den Benutzer in der Datenbank.
  const user = await User.findOne({ email: req.body.email });
  // Wenn wir den Benutzer finden und das Passwort übereinstimmt, melden wir ihn an.
  if (user && await bcrypt.compare(req.body.passwort, user.passwort)) {
    // Wir speichern die Benutzer-ID in der Sitzung.
    req.session.userId = user._id;
    // Dann leiten wir ihn zur Profilseite weiter.
    res.redirect('/profil');
  } else {
    // Wenn wir den Benutzer nicht finden oder das Passwort nicht stimmt, sagen wir das dem Benutzer.
    res.send('Falsche Anmeldeinformationen');
  }
});
 
module.exports = router; // Exportiert den Router für die Verwendung in anderen Dateien