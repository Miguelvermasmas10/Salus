const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const path = require('path');
const User = require('../models/user');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        type: 'OAuth2',
        user: '',
        clientId: '',
        clientSecret: '',
        refreshToken: '',
    }
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/views/passwort-reset.html'));
});


router.post('/', async (req, res) => {
    const { email } = req.body;

    try {
        // Überprüfen, ob die E-Mail-Adresse in der Datenbank existiert
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Die angegebene E-Mail-Adresse wurde nicht gefunden.' });
        }

        // Generiere ein zufälliges Passwort
        const randomPassword = Math.random().toString(36).slice(-8);

        // Setze das Passwort des Benutzers auf das generierte Passwort
        user.passwort = randomPassword;
        await user.save();

        // E-Mail mit dem neuen Passwort senden
        await transporter.sendMail({
            from: 'deine-email@gmail.com', // Hier deine E-Mail-Adresse eintragen
            to: email,
            subject: 'Salus - Passwort zurücksetzen',
            text: `Dein Passwort wurde erfolgreich zurückgesetzt. Dein neues Passwort lautet: ${randomPassword}`
        });

        res.json({ message: 'Das Passwort wurde zurückgesetzt. Überprüfe deine E-Mails für das neue Passwort.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' });
    }
});

module.exports = router;