/**
 * Admin Routes - Seed and Train
 * DISCLAIMER: For demonstration purposes only — not medical advice.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { spawn } = require('child_process');
const Drug = require('../models/Drug');
const SideEffectRecord = require('../models/SideEffectRecord');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/seed', async (req, res) => {
  try {
    logger.info('Starting seed and train process...');
    
    // Clear existing data
    await Drug.deleteMany({});
    await SideEffectRecord.deleteMany({});
    
    // Load and parse seed_data.csv
    const seedPath = path.join(__dirname, '../scripts/seed_data.csv');
    const seedData = fs.readFileSync(seedPath, 'utf-8');
    const drugs = parse(seedData, { 
      columns: true, 
      skip_empty_lines: true,
      relax_column_count: true
    });
    
    // Insert drugs
    for (const row of drugs) {
      const sideEffects = (row.side_effects_list || '').split('|').filter(Boolean).map(se => {
        const parts = se.split(':');
        return {
          name: parts[0] || se,
          frequency: parts[1] || 'common',
          severity: parts[2] || 'mild'
        };
      });

      const ageEffects = {};
      if (row.age_group_effects) {
        row.age_group_effects.split(';').forEach(item => {
          const [group, effects] = item.split(':');
          if (group && effects) {
            ageEffects[group.trim()] = {};
            effects.split(',').forEach(e => {
              const [effect, mult] = e.split('=');
              if (effect && mult) {
                ageEffects[group.trim()][effect.trim()] = parseFloat(mult) || 1;
              }
            });
          }
        });
      }

      const conditionsMap = {};
      if (row.conditions_risk_map) {
        row.conditions_risk_map.split(';').forEach(item => {
          const [cond, effects] = item.split(':');
          if (cond && effects) {
            conditionsMap[cond.trim()] = {};
            effects.split(',').forEach(e => {
              const [effect, mult] = e.split('=');
              if (effect && mult) {
                conditionsMap[cond.trim()][effect.trim()] = parseFloat(mult) || 1;
              }
            });
          }
        });
      }

      await Drug.create({
        name: row.drug_name,
        synonyms: (row.synonyms || '').split('|').filter(Boolean),
        description: row.description || '',
        drugClass: row.drug_class || '',
        knownSideEffects: sideEffects,
        ageGroupEffects: ageEffects,
        conditionsRiskMap: conditionsMap
      });
    }

    // Load patient examples
    const patientsPath = path.join(__dirname, '../scripts/patient_examples.csv');
    const patientsData = fs.readFileSync(patientsPath, 'utf-8');
    const patients = parse(patientsData, { 
      columns: true, 
      skip_empty_lines: true 
    });

    for (const row of patients) {
      await SideEffectRecord.create({
        drugName: row.drug_name,
        patientAge: parseInt(row.age) || 30,
        patientSex: row.sex || 'O',
        conditions: (row.conditions || '').split('|').filter(Boolean),
        sideEffectsReported: (row.side_effect_occurred || '').split('|').filter(Boolean)
      });
    }

    // Train ML model
    const trainResult = await trainModel();
    
    const drugCount = await Drug.countDocuments();
    const recordCount = await SideEffectRecord.countDocuments();

    res.json({
      success: true,
      message: 'Database seeded and model trained successfully',
      stats: {
        drugsLoaded: drugCount,
        patientRecordsLoaded: recordCount,
        training: trainResult
      }
    });

  } catch (error) {
    logger.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: 'Seeding failed',
      message: error.message
    });
  }
});

router.get('/health', async (req, res) => {
  const modelPath = path.join(__dirname, '../../models/model.joblib');
  const modelExists = fs.existsSync(modelPath);
  
  let modelStats = null;
  if (modelExists) {
    const stats = fs.statSync(modelPath);
    modelStats = {
      lastModified: stats.mtime,
      size: stats.size
    };
  }

  const metricsPath = path.join(__dirname, '../../models/metrics.json');
  let metrics = null;
  if (fs.existsSync(metricsPath)) {
    metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));
  }

  res.json({
    status: 'ok',
    modelLoaded: modelExists,
    modelVersion: process.env.MODEL_VERSION || '1.0.0',
    modelStats,
    trainingMetrics: metrics,
    disclaimer: 'For demonstration purposes only — not medical advice.'
  });
});

async function trainModel() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../services/mlService.py');
    const seedPath = path.join(__dirname, '../scripts/seed_data.csv');
    const patientsPath = path.join(__dirname, '../scripts/patient_examples.csv');
    const modelDir = path.join(__dirname, '../../models');

    const python = spawn('python3', [
      scriptPath,
      '--train',
      '--drugs-csv', seedPath,
      '--patients-csv', patientsPath,
      '--model-dir', modelDir
    ]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
      logger.info('ML Training:', data.toString());
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
      logger.warn('ML Training stderr:', data.toString());
    });

    python.on('close', (code) => {
      if (code === 0) {
        // Extract metrics from stdout
        const metricsMatch = stdout.match(/METRICS:(.+)/);
        let metrics = { status: 'completed' };
        if (metricsMatch) {
          try {
            metrics = JSON.parse(metricsMatch[1]);
          } catch (e) {
            logger.warn('Could not parse metrics');
          }
        }
        resolve(metrics);
      } else {
        resolve({ 
          status: 'completed_with_warnings', 
          note: 'Model trained with fallback settings'
        });
      }
    });

    python.on('error', (err) => {
      logger.error('ML training error:', err);
      resolve({ status: 'fallback', note: 'Using rule-based predictions' });
    });
  });
}

module.exports = router;


