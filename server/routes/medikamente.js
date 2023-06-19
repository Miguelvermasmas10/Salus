const express = require('express');
const router = express.Router();
const path = require('path');
const Medication = require("../models/medication");

// Funktion zum Prüfen, ob ein Benutzer angemeldet ist
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
  res.sendFile(path.join(__dirname, '../../client/views/medikamente.html'));  
});


router.get('/list', ensureAuthenticated, (req, res) => {
  // Abrufen der Medikamente aus der Datenbank
  Medication.find({ user: req.session.userId })
  .then(medications => {
    res.status(200).send(medications);
    }).catch(err => {
        console.error(err);
        res.status(500).send({ message: 'Fehler beim Abrufen der Medikamente' });
    });
});

router.post('/add', ensureAuthenticated, (req, res) => {
  // Abrufen der eingegebenen Informationen aus der Anfrage
  var medicationName = req.body.name;
  var medicationDosage = req.body.dose;
  var medicationTablets = req.body.tablets;
  var medicationTime = req.body.time;
  var medicationNotes = req.body.notes;

  // Wenn die ID nicht gesetzt ist, erstellen wir ein neues Medikament
  var medication = new Medication({
    name: medicationName,
    dosage: medicationDosage,
    tablets: medicationTablets,
    time: medicationTime,
    notes: medicationNotes,
    user: req.session.userId
  });

  medication.save()
  .then((result) => {
    res.json({ message: 'Medikament hinzugefügt', id: result._id });
  })
  .catch(err => {
    console.error(err);
    res.status(500).send({ message: 'Fehler beim Speichern des Medikaments' });
  });
});

router.put('/update/:id', ensureAuthenticated, (req, res) => {
  // Abrufen der ID des zu aktualisierenden Medikaments aus der Anfrage
  var medicationId = req.params.id;

  // Abrufen der aktualisierten Informationen aus der Anfrage
  var updatedMedication = {
      name: req.body.name,
      dosage: req.body.dosage,
      time: req.body.time,
      notes: req.body.notes,
      tablets: req.body.tablets
  };

  // Aktualisieren des Medikaments in der Datenbank
  Medication.updateOne({ _id: medicationId, user: req.session.userId }, updatedMedication)
      .then(() => {
          res.send({ message: 'Medikament aktualisiert' });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send({ message: 'Fehler beim Aktualisieren des Medikaments' });
      });
});

router.delete('/delete/:id', ensureAuthenticated, (req, res) => {
  // Abrufen der ID des zu löschenden Medikaments aus der Anfrage
  var medicationId = req.params.id;

  // Löschen des Medikaments aus der Datenbank
  Medication.deleteOne({ _id: medicationId, user: req.session.userId })
      .then(() => {
          res.send({ message: 'Medikament gelöscht' });
      })
      .catch(err => {
          console.error(err);
          res.status(500).send({ message: 'Fehler beim Löschen des Medikaments' });
      });
});

module.exports = router; // Exportiert den Router für die Verwendung in anderen Dateien