const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  req.session.destroy(function(err) {
    if(err) {
      return res.send('Fehler beim Logout');
    }    
    res.redirect('/anmelden');
  });
});

module.exports = router;