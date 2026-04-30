const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  synonyms: [{
    type: String
  }],
  description: {
    type: String,
    required: true
  },
  drugClass: {
    type: String
  },
  knownSideEffects: [{
    name: String,
    frequency: {
      type: String,
      enum: ['very_common', 'common', 'uncommon', 'rare', 'very_rare']
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    }
  }],
  ageGroupEffects: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  conditionsRiskMap: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

drugSchema.index({ name: 'text', 'synonyms': 'text' });

module.exports = mongoose.model('Drug', drugSchema);


