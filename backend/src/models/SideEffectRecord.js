const mongoose = require('mongoose');

const sideEffectRecordSchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: true,
    index: true
  },
  patientAge: {
    type: Number,
    required: true
  },
  patientSex: {
    type: String,
    enum: ['M', 'F', 'O'],
    required: true
  },
  conditions: [{
    type: String
  }],
  sideEffectsReported: [{
    type: String
  }],
  reportDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SideEffectRecord', sideEffectRecordSchema);


