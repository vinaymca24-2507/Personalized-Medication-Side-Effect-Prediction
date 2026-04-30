/**
 * Prediction Route
 * DISCLAIMER: For demonstration purposes only — not medical advice.
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const predictor = require('../services/predictor');
const Drug = require('../models/Drug');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/',
  [
    body('drugName').trim().notEmpty().withMessage('Drug name is required'),
    body('age').isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120'),
    body('sex').isIn(['M', 'F', 'O']).withMessage('Sex must be M, F, or O'),
    body('conditions').optional().isArray().withMessage('Conditions must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { drugName, age, sex, conditions = [] } = req.body;

      // Find drug in database
      const drug = await Drug.findOne({
        $or: [
          { name: new RegExp(`^${drugName}$`, 'i') },
          { synonyms: new RegExp(`^${drugName}$`, 'i') }
        ]
      });

      if (!drug) {
        return res.status(404).json({
          success: false,
          error: 'Drug not found',
          message: `No information found for "${drugName}". Please check spelling or try a different drug.`
        });
      }

      // Get predictions
      const result = await predictor.predict({
        drug,
        age: parseInt(age),
        sex,
        conditions
      });

      res.json({
        success: true,
        disclaimer: 'For demonstration purposes only — not medical advice. Consult a healthcare professional.',
        drugName: drug.name,
        patientProfile: { age, sex, conditions },
        predictions: result.predictions,
        modelVersion: result.modelVersion,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Prediction error:', error);
      res.status(500).json({
        success: false,
        error: 'Prediction failed',
        message: error.message
      });
    }
  }
);

module.exports = router;


