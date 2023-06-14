const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Document = require('../models/dokument');

// Funktion zum Prüfen, ob ein Benutzer angemeldet ist
function ensureAuthenticated(req, res, next) {
  // Wenn der Benutzer angemeldet ist, geht es weiter zur nächsten Funktion
  if (req.session.userId) {
    return next();
  }
  // Wenn der Benutzer nicht angemeldet ist, geben wir einen Fehler aus
  res.status(401).send({ message: 'Nicht autorisiert' });
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', ensureAuthenticated, (req, res) => {
  // Wenn ja, senden wir ihm die Profilseite
  res.sendFile(path.join(__dirname, '../../client/views/dokumente.html'));
});

// Route zum Hochladen von Dateien
router.post('/upload', ensureAuthenticated, upload.single('fileToUpload'), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).send('Es wurde keine Datei hochgeladen.');
    return;
  }
  try {
    const document = new Document({
      filename: file.originalname,
      data: file.buffer,
      contentType: file.mimetype,
      userId: req.session.userId 
    });
    await document.save();
    console.log('Datei in MongoDB hochgeladen');
    res.send('Datei erfolgreich hochgeladen.');
  } catch (err) {
    console.error('Fehler beim Hochladen der Datei in MongoDB:', err);
    res.status(500).send({ message: 'Fehler beim Hochladen der Datei.' });
  }
});

// Route zum Herunterladen einer Datei
router.get('/download/:id', ensureAuthenticated, async (req, res) => {
  const documentId = req.params.id;
  try {
    const document = await Document.findById(documentId);
    if (!document) {
      res.status(404).send({ message: 'Dokument nicht gefunden.' });
      return;
    }
    res.set('Content-Type', document.contentType);
    res.set('Content-Disposition', 'attachment; filename="' + document.filename + '"');
    res.send(document.data);
  } catch (err) {
    console.error('Fehler beim Herunterladen der Datei:', err);
    res.status(500).send({ message: 'Fehler beim Herunterladen der Datei.' });
  }
});

// Route zur Suche nach Dokumenten
router.get('/search', ensureAuthenticated, async (req, res) => {
  const query = req.query.q;
  try {
    const documents = await Document.find({
      userId: req.session.userId,  
      filename: { $regex: query, $options: 'i' }  
    });
    res.json(documents);
  } catch (err) {
    console.error('Fehler bei der Dokumentensuche:', err);
    res.status(500).send({ message: 'Fehler bei der Dokumentensuche.' });
  }
});

// Route zum Löschen einer Datei
router.delete('/delete/:id', ensureAuthenticated, async (req, res) => {
  const documentId = req.params.id;
  try {
    const document = await Document.findById(documentId);
    if (!document) {
      res.status(404).send({ message: 'Dokument nicht gefunden.' });
      return;
    }
    await document.deleteOne();
    console.log('Datei aus MongoDB gelöscht');
    res.send('Datei erfolgreich gelöscht.');
  } catch (err) {
    console.error('Fehler beim Löschen der Datei aus MongoDB:', err);
    res.status(500).send({ message: 'Fehler beim Löschen der Datei.' });
  }
});

// Route zum Abrufen aller Dokumente des Benutzers
router.get('/user', ensureAuthenticated, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.session.userId });
    res.json(documents);
  } catch (err) {
    console.error('Fehler beim Laden der Dokumente:', err);
    res.status(500).send({ message: 'Fehler beim Laden der Dokumente.' });
  }
});

module.exports = router;
