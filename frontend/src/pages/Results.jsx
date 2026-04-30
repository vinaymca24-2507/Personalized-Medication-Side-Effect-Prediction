import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SideEffectCard from '../components/SideEffectCard'

function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state

  if (!data) {
    return (
      <div className="card">
        <h1>No Results</h1>
        <p>Please submit a prediction request first.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go to Predict
        </button>
      </div>
    )
  }

  const { drugName, patientProfile, predictions, confidence, modelVersion, disclaimer } = data

  return (
    <div>
      <div className="card">
        <div className="results-header">
          <h1>Prediction Results for {drugName}</h1>
          <span className="confidence-badge">
            Confidence: {Math.round(confidence * 100)}%
          </span>
        </div>

        <div className="patient-info">
          <span>👤 Age: {patientProfile.age}</span>
          <span>⚧ Sex: {patientProfile.sex}</span>
          <span>🏥 Conditions: {patientProfile.conditions.length > 0 ? patientProfile.conditions.join(', ') : 'None'}</span>
        </div>

        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Model Version: {modelVersion}
        </p>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Predicted Side Effects ({predictions.length})</h2>

      {predictions.map((pred, index) => (
        <SideEffectCard key={index} prediction={pred} rank={index + 1} />
      ))}

      <div className="card" style={{ marginTop: '2rem', background: '#fef3c7' }}>
        <p style={{ color: '#92400e', fontWeight: 500 }}>
          ⚠️ {disclaimer}
        </p>
      </div>

      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/')}
        style={{ marginTop: '1rem' }}
      >
        ← New Prediction
      </button>
    </div>
  )
}

export default Results


