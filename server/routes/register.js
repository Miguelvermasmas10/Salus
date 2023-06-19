// Importiere erforderliche Module
const express = require('express'); // Modul für das Erstellen von Webanwendungen
const router = express.Router(); // Router für die Definierung von Routen
const path = require('path'); // Modul für den Dateipfad
const bcrypt = require('bcrypt'); // Modul für das Hashen von Passwörtern
const User = require('../models/user'); // Modell für den Benutzer

// Route für die Registrierungsseite
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/views/registrieren.html')); // Sendet die HTML-Datei der Registrierungsseite
});

// Route für das Verarbeiten des Registrierungsformulars
router.post('/', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email }); // Überprüft, ob ein Benutzer mit der E-Mail bereits existiert
    if (user) {
      return res.status(400).send('Ein Benutzer mit dieser E-Mail existiert bereits'); // Sendet eine Fehlermeldung, wenn ein Benutzer bereits existiert
    }

    const salt = await bcrypt.genSalt(10); // Generiert ein Salz für das Hashen des Passworts
    const hashedPasswort = await bcrypt.hash(req.body.passwort, salt); // Hasht das Passwort mit dem Salz

    user = new User({
      benutzername: req.body.benutzername,
      email: req.body.email,
      passwort: hashedPasswort
    }); // Erstellt ein neues Benutzerobjekt mit den Registrierungsdaten

    const savedUser = await user.save(); // Speichert den Benutzer in der Datenbank
    req.session.userId = savedUser._id; // Setzt die Benutzer-ID in der Sitzung
    res.redirect('/profil'); // Leitet den Benutzer auf die Profilseite weiter 
  } catch (err) {
    console.error(err);
    res.status(500).send(`Etwas ist schief gelaufen: ${err.message}`); // Sendet eine Fehlermeldung, wenn etwas schiefgeht
  }
});

module.exports = router; // Exportiert den Router für die Verwendung in anderen Dateien
