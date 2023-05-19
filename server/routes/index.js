const express = require('express');
const path = require('path');
const router = express.Router();

// Beispielroute
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/views/index.html'));
});

module.exports = router;