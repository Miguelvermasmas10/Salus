// Wir holen uns die Tools, die wir brauchen. Dazu gehören express für die Routen und unser User-Modell
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/user');
const Subscription = require("../models/subscription");

// Diese Funktion prüft, ob ein Benutzer angemeldet ist.
function ensureAuthenticated(req, res, next) {
  // Wenn der Benutzer angemeldet ist, geht es weiter zur nächsten Funktion
  if (req.session.userId) {
    return next();
  }
  // Wenn der Benutzer nicht angemeldet ist, geben wir einen Fehler aus
  res.status(401).send({ message: 'Nicht autorisiert' });
}

// Wenn jemand auf unsere Profilseite geht, prüfen wir zuerst, ob er angemeldet ist.
router.get('/', ensureAuthenticated, (req, res) => {
  // Wenn ja, senden wir ihm die Profilseite
  res.sendFile(path.join(__dirname, '../../client/views/profil.html'));
});

// Hier holen wir die Profilinformationen eines Benutzers.
router.get('/info', ensureAuthenticated, async (req, res) => {
  try {
    // Wir suchen den Benutzer in der Datenbank, aber ohne das Passwort.
    const user = await User.findById(req.session.userId).select('-passwort');
    // Wenn wir den Benutzer nicht finden, geben wir einen Fehler aus.
    if (!user) {
      return res.status(401).send({ message: 'Benutzer nicht gefunden' });
    }
    // Wenn wir den Benutzer gefunden haben, senden wir seine Informationen zurück.
    res.send(user);
  } catch (err) {
    // Wenn etwas schief geht, loggen wir den Fehler und senden eine Fehlermeldung zurück.
    console.error(err);
    res.status(500).send({ message: `Etwas ist schief gelaufen: ${err.message}` });
  }
});

// Hier ändern wir die Profilinformationen eines Benutzers.
router.post('/info', ensureAuthenticated, async (req, res) => {
  try {
    // Wir suchen zuerst den Benutzer in der Datenbank.
    const user = await User.findById(req.session.userId);
    // Wenn wir den Benutzer nicht finden, geben wir einen Fehler aus.
    if (!user) {
      return res.status(401).send({ message: 'Benutzer nicht gefunden' });
    }
    // Wir aktualisieren die Informationen des Benutzers mit den übermittelten Informationen.
    user.email = req.body.email;
    user.telefon = req.body.telefon;
    user.geburtsdatum = req.body.geburtsdatum;
    user.geschlecht = req.body.geschlecht;
    user.medizinischeBedingungen = req.body.medizinischeBedingungen;
    user.notfallkontakt = req.body.notfallkontakt;

    // Dann speichern wir die aktualisierten Informationen.
    await user.save();
    // Zum Schluss senden wir eine Bestätigung, dass alles geklappt hat.
    res.send({ message: 'Profilinformationen erfolgreich geändert' });
  } catch (err) {
    // Wenn etwas schief geht, loggen wir den Fehler und senden eine Fehlermeldung zurück.
    console.error(err);
    res.status(500).send({ message: `Etwas ist schief gelaufen: ${err.message}` });
  }
});

// Status des Authentifizierungsstatus abrufen
router.get('/status', ensureAuthenticated, (req, res) => {
  // Wenn der Benutzer angemeldet ist, senden wir den Status 'true'
  res.send({ status: true });
});

// Route zum Hinzufügen eines neuen Abonnements
router.post('/subscribe', ensureAuthenticated, async function(req, res) {
  let body = req.body;
  body["user"] = req.session.userId;
  const new_subscription = new Subscription(req.body);
  new_subscription.save().then(function() {
      console.log('Abonnement gespeichert!');
      res.sendStatus(200);
  }).catch(function(error) {
      console.error('Fehler beim Speichern des Abonnements', error);
      res.sendStatus(500);
  });

// Route zum Löschen eines Abonnements
router.delete('/unsubscribe', ensureAuthenticated, function(req, res) {
  Subscription.deleteOne({ endpoint: req.body.endpoint }).then(function() {
      res.sendStatus(200);
  }).catch(function(error) {
      console.error('Fehler beim Löschen des Abonnements', error);
      res.sendStatus(500);
  });
  });
});


// Zum Schluss geben wir den router zurück, damit andere Teile unseres Programms ihn nutzen können.
module.exports = router;  