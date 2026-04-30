/**
 * Drugs Route - Search and autocomplete
 * DISCLAIMER: For demonstration purposes only — not medical advice.
 */

const express = require('express');
const Drug = require('../models/Drug');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ drugs: [] });
    }

    const drugs = await Drug.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { synonyms: new RegExp(q, 'i') }
      ]
    })
    .select('name synonyms drugClass')
    .limit(10);

    res.json({
      drugs: drugs.map(d => ({
        name: d.name,
        synonyms: d.synonyms,
        drugClass: d.drugClass
      }))
    });

  } catch (error) {
    logger.error('Drug search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;


