const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {  
  res.sendFile(path.join(__dirname, '../../client/views/apotheken.html'));  
});

module.exports = router; // Exportiert den Router für die Verwendung in anderen Dateien