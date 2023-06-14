const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// Session Config
app.use(session({
  secret: 'irgendeinsecrettext',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/salus', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


// Routen
app.use('/', require('./routes/index'));
app.use('/anmelden', require('./routes/login'));
app.use('/registrieren', require('./routes/register'));
app.use('/profil', require('./routes/profile'));
app.use('/passwort-reset', require('./routes/password-reset')); 
app.use('/abmelden', require('./routes/abmelden'));
app.use('/apotheken', require('./routes/apotheken')); 
app.use('/dokumente', require('./routes/dokumente'));
app.use('/erinnerungen', require('./routes/erinnerungen')); 
app.use('/medikamente', require('./routes/medikamente'));

app.listen(port, () => {
  console.log(`WebApp läuft auf http://localhost:${port}`);
});
