const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const reminderRouter = require("./routes/reminder");
const Reminder = require("./models/reminder");
const Subscription = require("./models/subscription");
const cron = require('node-cron');
const moment = require('moment');
const webpush = require('web-push');
webpush.setVapidDetails(
    'mailto:severin.urbanek@stud.hshl.de',
    'BIzDewgUnFBMdyO-GzzoRrnBqcH4VZrW7q6mVFYDlzmcCSuPznIRo6Qnjdf8-_Fgb5MJ_hEVvVoaYs-mwIob3WA',
    'xrYPrWX0TgMJ17eqFUl2b3WdpQijm4n6ohvuL8dmWR4'
);

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
app.use(express.static(path.join(__dirname, '../')));
app.use(express.urlencoded({ extended: true }));

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


// MongoDB Connection
mongoose.connect('mongodb+srv://aldiwein:qxnLoL3YzH8whbvC@salus.mkxowi4.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.listen(port, () => {
  console.log(`WebApp läuft auf http://localhost:${port}`);
    //Start Sheduler
    cron.schedule('* * * * *', () => {
      console.log('Checking for reminders...');
      Reminder.find()
      .then(function(reminders){
          reminders.forEach(reminder => {
              var isNow = moment().format("YYYY-MM-DD, HH:mm") == moment(reminder.time).format("YYYY-MM-DD, HH:mm");
              if(isNow){
                  Subscription.find({ user: reminder.user })
                  .then(function(subscriptions) {
                      subscriptions.forEach(function(subscription) {
                          payload = reminder.name + " (" + reminder.dose + ")";
                          webpush.sendNotification(subscription, payload)
                          .then(function(){console.log("Notification sent: ", payload);})
                          .catch(error => function(){
                              console.error("Notification error: ", error);
                          });
                      });
                  });
                  if(reminder.interval == "Einmalig"){
                    Reminder.deleteOne({_id: reminder._id})
                    .then(function() {console.log("Reminder gelöscht");})
                    .catch(function(error) {console.error("Error: ", error);});
                  }else{
                    if(reminder.interval == "Täglich"){
                      var newTime = moment(reminder.time).add(1, "days");
                    }else if(reminder.interval == "Wöchentlich"){
                      var newTime = moment(reminder.time).add(1, "weeks");
                    }else if(reminder.interval == "Monatlich"){
                      var newTime = moment(reminder.time).add(1, "months");
                    }
                    let newReminder = {
                      name: reminder.name,
                      dose: reminder.dose,
                      time: newTime.format("YYYY-MM-DDTHH:mm:00.000+00:00"),
                      interval: reminder.interval
                    };
                    Reminder.updateOne({_id: reminder._id}, newReminder)
                    .then(function() {console.log("Reminder geupdated!");})
                    .catch(function(error) {console.error("Error: ", error);});
                  }
                }
          });
        }).catch(err => {
            console.error(err);
        });
    });
});