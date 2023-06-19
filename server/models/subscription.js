const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
    },
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);