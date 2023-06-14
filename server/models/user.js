const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  benutzername: { type: String, required: true },
  email: { type: String, required: true },
  passwort: { type: String, required: true },
  telefon: { type: String, required: false },
  geburtsdatum: { type: Date, required: false },
  geschlecht: { type: String, enum: ['Männlich', 'Weiblich', 'Andere'], required: false },
  medizinischeBedingungen: [{ type: String }],
  notfallkontakt: {
    name: { type: String, required: false },
    telefon: { type: String, required: false },
  },
});

module.exports = mongoose.model('User', userSchema);
