import React from 'react'
import PredictForm from '../components/PredictForm'

function Home() {
  return (
    <div>
      <div className="card">
        <h1>💊 Medication Side-Effect Predictor</h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Enter medication details and patient information to predict potential side effects.
          This tool uses a hybrid AI approach combining rules, machine learning, and NLP.
        </p>
      </div>
      <PredictForm />
    </div>
  )
}

export default Home


