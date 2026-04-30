import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <nav>
            <Link to="/" className="logo">💊 Side-Effect Predictor</Link>
            <div className="nav-links">
              <Link to="/">Predict</Link>
              <Link to="/admin">Admin</Link>
            </div>
          </nav>
          <div className="disclaimer">
            ⚠️ For demonstration purposes only — not medical advice. Consult a healthcare professional.
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <footer>
          <p>⚠️ DISCLAIMER: This tool is for educational purposes only. Do not make medical decisions based on these predictions.</p>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Please consult a licensed healthcare provider for medical advice.'); }}>
            Contact a Healthcare Professional
          </a>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App


