const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
