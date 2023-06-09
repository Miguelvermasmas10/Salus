const express = require("express");
const path = require('path');
const router = express.Router();
const Reminder = require("../models/reminder");

// Diese Funktion prüft, ob ein Benutzer angemeldet ist.
function ensureAuthenticated(req, res, next) {
  // Wenn der Benutzer angemeldet ist, geht es weiter zur nächsten Funktion
  if (req.session.userId) {
    return next();
  }
  // Wenn der Benutzer nicht angemeldet ist, geben wir einen Fehler aus
  // res.status(401).send({ message: 'Nicht autorisiert' });

  res.redirect("/anmelden")
}

router.get('/', ensureAuthenticated, (req, res) => {
  // Wenn ja, senden wir ihm die Erinnerungsseite
  res.sendFile(path.join(__dirname, '../../client/views/erinnerungen.html'));
});

router.get('/list', ensureAuthenticated, (req, res) => {
  // Abrufen der Medikamente aus der Datenbank
  Reminder.find({ user: req.session.userId })
  .then(reminders => {
    res.status(200).send(reminders);
    }).catch(err => {
        console.error(err);
        res.status(500).send({ message: 'Fehler beim Abrufen der Medikamente' });
    });
});

router.post('/add', ensureAuthenticated, (req, res) => {
  // Abrufen der eingegebenen Informationen aus der Anfrage
  var medicationName = req.body.name;
  var medicationDose = req.body.dose;
  var medicationTime = req.body.time;
  var medicationInterval = req.body.interval;

  // Erstellen eines neuen Reminder-Dokuments
  var reminder = new Reminder({
      name: medicationName,
      dose: medicationDose,
      time: medicationTime,
      interval: medicationInterval,
      user: req.session.userId
  });

    // Speichern des neuen Reminder-Dokuments in der Datenbank
    reminder.save()
        .then((result) => {
            res.json({ message: 'Medikament hinzugefügt', id: result._id });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: 'Fehler beim Speichern des Medikaments' });
        });
});

router.delete('/delete/:id', ensureAuthenticated, (req, res) => {
  // Abrufen der ID des zu löschenden Medikaments aus der Anfrage
  var medicationId = req.params.id;

  // Löschen des Medikaments aus der Datenbank
  Reminder.deleteOne({ _id: medicationId, user: req.session.userId })
      .then(() => {
          res.send({ message: 'Medikament gelöscht' });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send({ message: 'Fehler beim Löschen des Medikaments' });
      });
});

router.put('/update/:id', ensureAuthenticated, (req, res) => {
  // Abrufen der ID des zu aktualisierenden Medikaments aus der Anfrage
  var medicationId = req.params.id;

  // Abrufen der aktualisierten Informationen aus der Anfrage
  var updatedMedication = {
      name: req.body.name,
      dose: req.body.dose,
      time: req.body.time,
      interval: req.body.interval
  };

  // Aktualisieren des Medikaments in der Datenbank
  Reminder.updateOne({ _id: medicationId, user: req.session.userId }, updatedMedication)
      .then(() => {
          res.send({ message: 'Medikament aktualisiert' });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send({ message: 'Fehler beim Aktualisieren des Medikaments' });
      });
});
 
module.exports = router; // Exportiert den Router für die Verwendung in anderen Dateien