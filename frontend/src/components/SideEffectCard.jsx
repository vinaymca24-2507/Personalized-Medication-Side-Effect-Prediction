import React from 'react'

function SideEffectCard({ prediction, rank }) {
  const { sideEffect, probability, riskLevel, severity, contributions, reason } = prediction
  const percentProb = Math.round(probability * 100)

  return (
    <div className={`side-effect-card ${riskLevel}`}>
      <div className="side-effect-header">
        <div className="side-effect-name">
          #{rank} {sideEffect}
        </div>
        <div className="side-effect-meta">
          <span className={`risk-badge ${riskLevel}`}>
            {riskLevel} risk
          </span>
        </div>
      </div>

      <div className="probability-bar">
        <div 
          className={`probability-fill ${riskLevel}`}
          style={{ width: `${percentProb}%` }}
        />
      </div>

      <div style={{ marginBottom: '0.75rem', fontWeight: 500 }}>
        Probability: {percentProb}%
        <span style={{ color: '#64748b', marginLeft: 8, fontWeight: 400 }}>
          • Severity: {severity}
        </span>
      </div>

      <div className="contributions">
        <span className="contribution-badge">
          📋 Rule: {contributions.rule.percentage}%
        </span>
        <span className="contribution-badge">
          🤖 ML: {contributions.ml.percentage}%
        </span>
        <span className="contribution-badge">
          📝 NLP: {contributions.nlp.percentage}%
        </span>
      </div>

      <p className="reason-text">
        💡 {reason}
      </p>
    </div>
  )
}

export default SideEffectCard


