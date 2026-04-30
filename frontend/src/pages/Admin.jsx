import React, { useState, useEffect } from 'react'
import { seedDatabase, getHealth } from '../api/apiClient'

function Admin() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const data = await getHealth()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch status: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleSeed = async () => {
    try {
      setSeeding(true)
      setMessage(null)
      setError(null)
      const result = await seedDatabase()
      setMessage(`Success! Loaded ${result.stats.drugsLoaded} drugs and ${result.stats.patientRecordsLoaded} patient records. Model trained.`)
      fetchStatus()
    } catch (err) {
      setError('Seeding failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h1>🔧 Admin Panel</h1>
        <p style={{ color: '#64748b' }}>
          Manage database and ML model training.
        </p>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="card">
        <h2>System Status</h2>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading status...</p>
          </div>
        ) : status ? (
          <div className="admin-status">
            <div className="status-item">
              <div className="status-label">Status</div>
              <div className={`status-value ${status.status === 'ok' ? 'success' : 'warning'}`}>
                {status.status === 'ok' ? '✓ Online' : '⚠ Issue'}
              </div>
            </div>
            <div className="status-item">
              <div className="status-label">Model Loaded</div>
              <div className={`status-value ${status.modelLoaded ? 'success' : 'warning'}`}>
                {status.modelLoaded ? '✓ Yes' : '✗ No'}
              </div>
            </div>
            <div className="status-item">
              <div className="status-label">Model Version</div>
              <div className="status-value">{status.modelVersion || 'N/A'}</div>
            </div>
            {status.trainingMetrics && (
              <>
                <div className="status-item">
                  <div className="status-label">Accuracy</div>
                  <div className="status-value">
                    {(status.trainingMetrics.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-label">F1 Score</div>
                  <div className="status-value">
                    {(status.trainingMetrics.f1_score * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-label">Training Samples</div>
                  <div className="status-value">
                    {status.trainingMetrics.training_samples || 'N/A'}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <p>No status available</p>
        )}
      </div>

      <div className="card">
        <h2>Seed Database & Train Model</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          This will load synthetic drug data and patient records, then train the ML model.
          Run this once when setting up the application.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={handleSeed}
          disabled={seeding}
        >
          {seeding ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16, marginRight: 8, borderWidth: 2 }}></span>
              Seeding & Training...
            </>
          ) : (
            '🌱 Seed & Train'
          )}
        </button>
      </div>

      <div className="card" style={{ background: '#fef3c7' }}>
        <h2 style={{ color: '#92400e' }}>⚠️ Important Notes</h2>
        <ul style={{ color: '#92400e', marginLeft: '1.5rem' }}>
          <li>This uses synthetic data for demonstration</li>
          <li>For real-world use, import validated datasets (SIDER, FAERS)</li>
          <li>Model should be clinically validated before any real use</li>
          <li>This is NOT medical advice</li>
        </ul>
      </div>
    </div>
  )
}

export default Admin


