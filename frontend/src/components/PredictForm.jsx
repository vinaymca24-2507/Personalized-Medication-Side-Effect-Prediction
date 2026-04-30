import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DrugAutocomplete from './DrugAutocomplete'
import { predict } from '../api/apiClient'

const CONDITIONS = [
  'Heart Disease',
  'Diabetes',
  'Liver Disease',
  'Kidney Disease',
  'Hypertension',
  'Asthma',
  'Depression',
  'Anxiety Disorder'
]

function PredictForm() {
  const navigate = useNavigate()
  const [drugName, setDrugName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('O')
  const [conditions, setConditions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConditionToggle = (condition) => {
    setConditions(prev => 
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!drugName.trim()) {
      setError('Please enter a drug name')
      return
    }
    if (!age || age < 0 || age > 120) {
      setError('Please enter a valid age (0-120)')
      return
    }

    try {
      setLoading(true)
      const result = await predict({
        drugName: drugName.trim(),
        age: parseInt(age),
        sex,
        conditions: conditions.map(c => c.toLowerCase())
      })

      if (result.success) {
        navigate('/results', { state: result })
      } else {
        setError(result.message || 'Prediction failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get predictions. Make sure to seed the database first.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Enter Patient Information</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label>Drug Name *</label>
        <DrugAutocomplete value={drugName} onChange={setDrugName} />
      </div>

      <div className="form-group">
        <label>Patient Age *</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Enter age (0-120)"
          min="0"
          max="120"
        />
      </div>

      <div className="form-group">
        <label>Sex</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="sex"
              value="M"
              checked={sex === 'M'}
              onChange={(e) => setSex(e.target.value)}
            />
            Male
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="sex"
              value="F"
              checked={sex === 'F'}
              onChange={(e) => setSex(e.target.value)}
            />
            Female
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="sex"
              value="O"
              checked={sex === 'O'}
              onChange={(e) => setSex(e.target.value)}
            />
            Other
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Pre-existing Conditions</label>
        <div className="conditions-grid">
          {CONDITIONS.map(condition => (
            <label key={condition} className="condition-checkbox">
              <input
                type="checkbox"
                checked={conditions.includes(condition)}
                onChange={() => handleConditionToggle(condition)}
              />
              {condition}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Predicting...' : '🔮 Predict Side Effects'}
      </button>
    </form>
  )
}

export default PredictForm


