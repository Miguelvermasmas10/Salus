const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Anmelderoute
router.post('/anmelden', async (req, res) => {
  const { benutzername, passwort } = req.body;

  try {
    // Benutzer in der Datenbank suchen
    const benutzer = await User.findOne({ benutzername });

    if (!benutzer) {
      return res.status(404).json({ fehler: 'Benutzer nicht gefunden' });
    }

    // Passwort überprüfen
    const passwortUebereinstimmend = await bcrypt.compare(passwort, benutzer.passwort);

    if (!passwortUebereinstimmend) {
      return res.status(401).json({ fehler: 'Ungültiges Passwort' });
    }

    // Benutzer erfolgreich angemeldet
    // Hier kannst du eine Session erstellen oder einen JWT-Token generieren

    res.json({ nachricht: 'Anmeldung erfolgreich' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ fehler: 'Serverfehler' });
  }
});

// Weitere Routen für Registrierung, Abmeldung usw.

module.exports = router;
