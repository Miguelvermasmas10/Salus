// server/app.js
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

const notification = require("./notification");
const reminderRouter = require("./routes/reminder");

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
mongoose.connect('mongodb+srv://aldiwein:qxnLoL3YzH8whbvC@salus.mkxowi4.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
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
app.use('/medikamente', require('./routes/medikamente'));
app.use('/erinnerungen', require('./routes/reminder'));
app.use("/reminder", reminderRouter);

// Fehlerbehandlungsmiddleware
app.use((err, req, res, next) => {
  // Setzen Sie den Content-Type-Header auf "application/json"
  res.setHeader("Content-Type", "application/json");
  // Senden Sie einen Fehlerstatus und eine JSON-Nachricht
  res.status(err.status || 500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`WebApp läuft auf http://localhost:${port}`);
});

/*
// Create a sample reminder object
const reminder = {
  user: { name: "John" },
  type: "Medicine",
  name: "Ibuprofen",
  date: new Date(),
  interval: 0,
  dose: 2,
};

// Run the notification function with the reminder object
notification(reminder);
*/