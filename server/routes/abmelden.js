// Wir brauchen express und einen router, um eine Route für den Logout zu erstellen
const express = require('express');
const router = express.Router();

// Wenn jemand einen Post-Request an diese Route schickt, startet der Logout-Prozess
router.get('/', (req, res) => {
  // Wir versuchen, die aktuelle Sitzung des Benutzers zu beenden
  req.session.destroy(function(err) {
    // Wenn dabei ein Fehler auftritt, senden wir eine Fehlermeldung
    if(err) {
      return res.send('Fehler beim Logout');
    }    
    // Wenn alles gut geht, leiten wir den Benutzer zur Anmeldeseite um
    res.redirect('/anmelden');
  });
});
 
module.exports = router;// Exportiert den Router für die Verwendung in anderen Dateien
