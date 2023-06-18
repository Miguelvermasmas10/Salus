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
  res.status(401).send({ message: 'Nicht autorisiert' });
}

router.get('/', ensureAuthenticated, (req, res) => {  
  res.sendFile(path.join(__dirname, '../../client/views/medikamente.html'));  
});

router.post('/add', ensureAuthenticated, (req, res) => {
  // Abrufen der eingegebenen Informationen aus der Anfrage
  var medicationName = req.body.name;
  var medicationDosage = req.body.dosage;
  var medicationTablets = req.body.tablets;
  var medicationTime = req.body.time;
  var medicationNotes = req.body.notes;

  // Erstellen eines neuen Medication-Dokuments
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

/*

// Get a specific medication
router.get('/:id', ensureAuthenticated, async (req, res) => {
  const medication = await Medication.findById(req.params.id);
  res.json(medication);
});

// Update a medication
router.put('/:id', ensureAuthenticated, async (req, res) => {
  const updatedMedication = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedMedication);
});

// Delete a medication
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  const deletedMedication = await Medication.findByIdAndDelete(req.params.id);
  res.json(deletedMedication);
});
*/
module.exports = router;