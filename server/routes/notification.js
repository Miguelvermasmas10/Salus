const express = require("express");
const path = require('path');
const router = express.Router();
const Reminder = require("../models/reminder");
const Subscription = require('../models/subscription');
const webpush = require('web-push');


const vapidKeys = {
    publicKey: 'BIzDewgUnFBMdyO-GzzoRrnBqcH4VZrW7q6mVFYDlzmcCSuPznIRo6Qnjdf8-_Fgb5MJ_hEVvVoaYs-mwIob3WA',
    privateKey: 'xrYPrWX0TgMJ17eqFUl2b3WdpQijm4n6ohvuL8dmWR4'
};
  
webpush.setVapidDetails(
    'mailto:severin.urbanek@stud.hshl.de',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Diese Funktion prüft, ob ein Benutzer angemeldet ist.
function ensureAuthenticated(req, res, next) {
  // Wenn der Benutzer angemeldet ist, geht es weiter zur nächsten Funktion
  if (req.session.userId) {
    return next();
  }
  // Wenn der Benutzer nicht angemeldet ist, geben wir einen Fehler aus
  res.status(401).send({ message: 'Nicht autorisiert' });
}

function sendReminder(payload){
    Subscription.find().then(function(subscriptions) {
        subscriptions.forEach(subscription => {
            webpush.sendNotification(subscription, payload)
            .then(function(){
                console.log("Notification sent!");
            })
            .catch(error => function(){
                console.error("Notification error: ", error);
            });
        });
    });
}

// Route zum Hinzufügen eines neuen Abonnements
router.post('/subscribe', ensureAuthenticated, function(req, res) {
    let body = req.body;
    body["user"] = req.session.userId;
    const subscription = new Subscription(req.body);
    subscription.save().then(function() {
        res.sendStatus(200);
    }).catch(function(error) {
        console.error('Fehler beim Speichern des Abonnements', error);
        res.sendStatus(500);
    });
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

// Export the router
module.exports = router;