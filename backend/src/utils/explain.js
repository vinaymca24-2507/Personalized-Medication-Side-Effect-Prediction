/**
 * Explainability utilities for side effect predictions
 * DISCLAIMER: For demonstration purposes only — not medical advice.
 */

const generateExplanation = (sideEffect, contributions) => {
  const reasons = [];
  
  if (contributions.rule && contributions.rule.value > 0) {
    reasons.push(contributions.rule.reason);
  }
  
  if (contributions.ml && contributions.ml.value > 0.3) {
    reasons.push('ML model indicates elevated risk based on similar patient profiles');
  }
  
  if (contributions.nlp && contributions.nlp.value > 0.2) {
    reasons.push('Drug information suggests this side effect is commonly reported');
  }
  
  if (reasons.length === 0) {
    reasons.push('General risk assessment based on drug profile');
  }
  
  return reasons.join('. ') + '.';
};

const getRiskLevel = (probability) => {
  if (probability >= 0.7) return 'high';
  if (probability >= 0.4) return 'moderate';
  return 'low';
};

const formatContributions = (rule, ml, nlp) => {
  return {
    rule: {
      value: Math.round(rule.value * 100) / 100,
      percentage: Math.round(rule.value * 100),
      reason: rule.reason || 'Standard risk'
    },
    ml: {
      value: Math.round(ml * 100) / 100,
      percentage: Math.round(ml * 100)
    },
    nlp: {
      value: Math.round(nlp * 100) / 100,
      percentage: Math.round(nlp * 100)
    }
  };
};

module.exports = {
  generateExplanation,
  getRiskLevel,
  formatContributions
};


