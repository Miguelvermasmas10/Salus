const express = require('express');
const path = require('path');
const User = require('./models/user');


const app = express();
app.use(express.static('client'));

const port = 3000;

// Statische Dateien aus dem "public" Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../client/public')));

// Routen definieren
const indexRoute = require('./routes/index');
app.use('/', indexRoute);

 

app.get('/anmelden', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '../../client/views/anmelden.html'));
});

// POST-Anfrage zur Verarbeitung der Anmeldung
app.post('/anmelden', (req, res) => {
  const { email, password } = req.body;

  // Neue Benutzerinstanz erstellen
  const newUser = new User({
    email: email,
    password: password,
  });

  // Benutzer in der Datenbank speichern
  newUser.save((err) => {
    if (err) {
      console.log(err);
      res.status(500).send('Fehler beim Speichern des Benutzers');
    } else {
      res.redirect('/'); // Weiterleitung zur Startseite nach erfolgreicher Anmeldung
    }
  });
});

// Server starten
app.listen(port, () => {
    console.log(`WebApp läuft auf http://localhost:${port}`);
});