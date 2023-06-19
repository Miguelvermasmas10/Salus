const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
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
    dosage: {
        type: String,
        required: false,
        default: "30mg"
    },
    time: {
        type: String,
        required: false,
        default: "20:00"
    },
    tablets: {
        type: String,
        default: "1 Tablette"
    },
    notes: {
        type: String,
        required: false,
        default: "..."
    }
});

module.exports = mongoose.model('Medication', MedicationSchema);