/**
 * Predictor Service - Combines Rule, ML, and NLP predictions
 * DISCLAIMER: For demonstration purposes only — not medical advice.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { generateExplanation, getRiskLevel, formatContributions } = require('../utils/explain');
const logger = require('../utils/logger');

// Configurable weights from environment
const WEIGHTS = {
  rule: parseFloat(process.env.RULE_WEIGHT) || 0.35,
  ml: parseFloat(process.env.ML_WEIGHT) || 0.45,
  nlp: parseFloat(process.env.NLP_WEIGHT) || 0.20
};

// Age-based risk rules
const AGE_RULES = {
  elderly: { // age >= 65
    dizziness: { multiplier: 1.5, reason: 'Elderly patients (65+) have increased risk of dizziness' },
    falls: { multiplier: 1.8, reason: 'Fall risk elevated in elderly patients' },
    confusion: { multiplier: 1.4, reason: 'Cognitive side effects more common in elderly' },
    bleeding: { multiplier: 1.6, reason: 'Bleeding risk increases with age' },
    drowsiness: { multiplier: 1.3, reason: 'Sedation effects stronger in elderly' }
  },
  pediatric: { // age < 18
    'growth issues': { multiplier: 1.5, reason: 'May affect development in pediatric patients' },
    'behavioral changes': { multiplier: 1.4, reason: 'Pediatric patients may show behavioral side effects' }
  }
};

// Condition-based risk rules
const CONDITION_RULES = {
  'liver disease': {
    'liver toxicity': { multiplier: 2.0, reason: 'Pre-existing liver disease increases hepatotoxicity risk' },
    nausea: { multiplier: 1.3, reason: 'GI symptoms may be amplified with liver disease' }
  },
  'kidney disease': {
    'kidney problems': { multiplier: 2.0, reason: 'Existing kidney impairment increases nephrotoxicity risk' },
    'fluid retention': { multiplier: 1.5, reason: 'Renal function affects fluid balance' }
  },
  'heart disease': {
    'heart palpitations': { multiplier: 1.6, reason: 'Cardiac patients at higher risk for rhythm issues' },
    bleeding: { multiplier: 1.4, reason: 'Often on anticoagulants, increasing bleeding risk' },
    'low blood pressure': { multiplier: 1.5, reason: 'Cardiovascular medication interactions' }
  },
  diabetes: {
    hypoglycemia: { multiplier: 1.5, reason: 'Blood sugar regulation may be affected' },
    'weight gain': { multiplier: 1.3, reason: 'Metabolic effects may be enhanced' }
  },
  hypertension: {
    dizziness: { multiplier: 1.3, reason: 'Blood pressure medications may cause orthostatic effects' },
    'low blood pressure': { multiplier: 1.4, reason: 'Risk of excessive BP lowering' }
  },
  asthma: {
    'breathing difficulty': { multiplier: 1.8, reason: 'Respiratory side effects more serious with asthma' },
    bronchospasm: { multiplier: 2.0, reason: 'Asthma patients at high risk for bronchospasm' }
  }
};

class Predictor {
  constructor() {
    this.modelVersion = process.env.MODEL_VERSION || '1.0.0';
  }

  async predict({ drug, age, sex, conditions }) {
    // Get all potential side effects from drug
    const knownEffects = drug.knownSideEffects || [];
    
    // Calculate scores for each side effect
    const predictions = [];
    
    for (const effect of knownEffects) {
      const effectName = effect.name.toLowerCase();
      
      // Base NLP score from drug's known side effects
      const nlpScore = this.calculateNLPScore(effect);
      
      // Rule-based adjustments
      const ruleResult = this.applyRules(effectName, age, conditions, drug);
      
      // ML score (call Python if model exists, otherwise estimate)
      const mlScore = await this.getMLScore(drug.name, age, sex, conditions, effectName);
      
      // Combine scores
      const finalScore = (
        WEIGHTS.rule * ruleResult.score +
        WEIGHTS.ml * mlScore +
        WEIGHTS.nlp * nlpScore
      );
      
      const contributions = formatContributions(
        { value: ruleResult.score, reason: ruleResult.reason },
        mlScore,
        nlpScore
      );
      
      predictions.push({
        sideEffect: effect.name,
        probability: Math.min(0.99, Math.max(0.01, finalScore)),
        riskLevel: getRiskLevel(finalScore),
        severity: effect.severity || 'mild',
        contributions,
        reason: generateExplanation(effect.name, contributions)
      });
    }
    
    // Sort by probability descending
    predictions.sort((a, b) => b.probability - a.probability);
    
    // Calculate overall confidence
    const confidence = this.calculateConfidence(predictions, knownEffects.length);
    
    return {
      predictions: predictions.slice(0, 10), // Top 10
      modelVersion: this.modelVersion,
      confidence
    };
  }

  calculateNLPScore(effect) {
    // Base score from frequency
    const frequencyScores = {
      very_common: 0.8,
      common: 0.6,
      uncommon: 0.3,
      rare: 0.15,
      very_rare: 0.05
    };
    return frequencyScores[effect.frequency] || 0.4;
  }

  applyRules(effectName, age, conditions, drug) {
    let score = 0.3; // Base rule score
    let reasons = [];
    
    // Age-based rules
    if (age >= 65) {
      const elderlyRules = AGE_RULES.elderly;
      if (elderlyRules[effectName]) {
        score *= elderlyRules[effectName].multiplier;
        reasons.push(elderlyRules[effectName].reason);
      }
    } else if (age < 18) {
      const pediatricRules = AGE_RULES.pediatric;
      if (pediatricRules[effectName]) {
        score *= pediatricRules[effectName].multiplier;
        reasons.push(pediatricRules[effectName].reason);
      }
    }
    
    // Condition-based rules
    for (const condition of conditions) {
      const condLower = condition.toLowerCase();
      if (CONDITION_RULES[condLower] && CONDITION_RULES[condLower][effectName]) {
        score *= CONDITION_RULES[condLower][effectName].multiplier;
        reasons.push(CONDITION_RULES[condLower][effectName].reason);
      }
    }
    
    // Drug-specific rules from database
    if (drug.ageGroupEffects) {
      const ageGroup = age >= 65 ? 'elderly' : (age < 18 ? 'pediatric' : 'adult');
      const ageEffects = drug.ageGroupEffects.get(ageGroup);
      if (ageEffects && ageEffects[effectName]) {
        score *= ageEffects[effectName];
        reasons.push(`Drug has specific ${ageGroup} risk factor`);
      }
    }
    
    if (drug.conditionsRiskMap) {
      for (const condition of conditions) {
        const condEffects = drug.conditionsRiskMap.get(condition.toLowerCase());
        if (condEffects && condEffects[effectName]) {
          score *= condEffects[effectName];
          reasons.push(`Drug interacts with ${condition}`);
        }
      }
    }
    
    return {
      score: Math.min(1, score),
      reason: reasons.length > 0 ? reasons[0] : 'Standard risk assessment'
    };
  }

  async getMLScore(drugName, age, sex, conditions, effectName) {
    const modelPath = path.join(__dirname, '../../models/model.joblib');
    
    if (!fs.existsSync(modelPath)) {
      // Fallback: estimate based on known patterns
      return this.estimateMLScore(age, effectName);
    }
    
    try {
      return await this.callMLService(drugName, age, sex, conditions, effectName);
    } catch (error) {
      logger.warn('ML service unavailable, using fallback:', error.message);
      return this.estimateMLScore(age, effectName);
    }
  }

  estimateMLScore(age, effectName) {
    // Simple heuristic when ML model not available
    let base = 0.35;
    if (age > 65) base += 0.1;
    if (age < 18) base += 0.05;
    return base;
  }

  async callMLService(drugName, age, sex, conditions, effectName) {
    return new Promise((resolve) => {
      const scriptPath = path.join(__dirname, 'mlService.py');
      const modelDir = path.join(__dirname, '../../models');
      
      const python = spawn('python', [
        scriptPath,
        '--predict',
        '--drug', drugName,
        '--age', age.toString(),
        '--sex', sex,
        '--conditions', conditions.join(','),
        '--model-dir', modelDir
      ]);

      let stdout = '';
      python.stdout.on('data', (data) => { stdout += data.toString(); });
      
      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            const prediction = result.predictions?.find(
              p => p.side_effect.toLowerCase() === effectName.toLowerCase()
            );
            resolve(prediction ? prediction.ml_probability : 0.35);
          } catch {
            resolve(0.35);
          }
        } else {
          resolve(0.35);
        }
      });

      python.on('error', () => resolve(0.35));
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(0.35), 5000);
    });
  }

  calculateConfidence(predictions, totalKnown) {
    if (predictions.length === 0) return 0.5;
    
    // Confidence based on data availability and model status
    const modelPath = path.join(__dirname, '../../models/model.joblib');
    const modelExists = fs.existsSync(modelPath);
    
    let confidence = modelExists ? 0.75 : 0.55;
    
    // Adjust based on prediction distribution
    const avgProb = predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length;
    if (avgProb > 0.3 && avgProb < 0.7) {
      confidence += 0.1; // Well-distributed predictions
    }
    
    return Math.round(confidence * 100) / 100;
  }

  async getStatus() {
    const modelPath = path.join(__dirname, '../../models/model.joblib');
    const metricsPath = path.join(__dirname, '../../models/metrics.json');
    
    let metrics = null;
    if (fs.existsSync(metricsPath)) {
      try {
        metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));
      } catch (e) {
        logger.warn('Could not read metrics file');
      }
    }

    return {
      modelLoaded: fs.existsSync(modelPath),
      modelVersion: this.modelVersion,
      weights: WEIGHTS,
      trainingMetrics: metrics
    };
  }
}

module.exports = new Predictor();


