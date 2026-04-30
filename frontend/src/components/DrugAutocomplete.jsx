import React, { useState, useEffect, useRef } from 'react'
import { searchDrugs } from '../api/apiClient'

function DrugAutocomplete({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([])
        return
      }

      try {
        setLoading(true)
        const result = await searchDrugs(value)
        setSuggestions(result.drugs || [])
      } catch (err) {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [value])

  const handleSelect = (drug) => {
    onChange(drug.name)
    setShowSuggestions(false)
  }

  return (
    <div className="autocomplete" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Start typing a drug name..."
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-list">
          {suggestions.map((drug, index) => (
            <div
              key={index}
              className="autocomplete-item"
              onClick={() => handleSelect(drug)}
            >
              <strong>{drug.name}</strong>
              {drug.drugClass && (
                <span style={{ color: '#64748b', marginLeft: 8, fontSize: '0.875rem' }}>
                  ({drug.drugClass})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div style={{ position: 'absolute', right: 12, top: 12, color: '#64748b' }}>
          Searching...
        </div>
      )}
    </div>
  )
}

export default DrugAutocomplete


