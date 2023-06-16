const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
    },
  name: { 
    type: String,
    minlength: 1,
    maxlength: 100,
    required: true 
  },
  time: { 
    type: Date, 
    required: true 
  },
  interval: { 
    type: String,
    enum: ["Einmalig", "Täglich", "Wöchentlich", "Monatlich"],
    default: "Einmalig"
  },
  dose: { 
      type: String,
      default: "1 Tablette"
  },
});

module.exports = mongoose.model("Reminder", reminderSchema);