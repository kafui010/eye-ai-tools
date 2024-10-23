'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import debounce from 'lodash/debounce'

// Predefined medical conditions with emojis
const predefinedMedicalConditions = [
  { id: 'diabetes', emoji: '🍬', label: 'Diabetes' },
  { id: 'hypertension', emoji: '🩺', label: 'Hypertension' },
  { id: 'arthritis', emoji: '🦴', label: 'Arthritis' },
  { id: 'thyroid', emoji: '🦋', label: 'Thyroid Disease' },
  { id: 'autoimmune', emoji: '🛡️', label: 'Autoimmune Disorder' },
  { id: 'migraine', emoji: '🤕', label: 'Migraine' },
  { id: 'asthma', emoji: '🫁', label: 'Asthma' },
  { id: 'ulcer', emoji: '🔴', label: 'Ulcer' },
  { id: 'others', emoji: '🔍', label: 'Others' },
]

// Extended medical conditions with emojis for suggestions
const allPossibleMedicalConditions = [
  { id: 'copd', emoji: '🌬️', label: 'Chronic Obstructive Pulmonary Disease (COPD)' },
  { id: 'alzheimer', emoji: '🧠', label: "Alzheimer's Disease" },
  { id: 'multiple_sclerosis', emoji: '🧬', label: 'Multiple Sclerosis' },
  // ... (include all other conditions from the original code)
]

// Simulated API call for medical condition suggestions
const fetchMedicalSuggestions = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
  return allPossibleMedicalConditions.filter(condition => 
    condition.label.toLowerCase().includes(query.toLowerCase())
  )
}

export function MedicalConditions({ medicalConditions, setMedicalConditions }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef(null)

  const debouncedFetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length > 0) {
        const fetchedSuggestions = await fetchMedicalSuggestions(query)
        setSuggestions(fetchedSuggestions)
      } else {
        setSuggestions([])
      }
    }, 300),
    []
  )

  const toggleMedicalCondition = (conditionId) => {
    if (conditionId === 'others') {
      setShowSearch(true)
      return
    }
    setMedicalConditions((prev) => {
      if (prev.includes(conditionId)) {
        return prev.filter((c) => c !== conditionId)
      } else {
        return [...prev, conditionId]
      }
    })
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedFetchSuggestions(value)
  }

  const addCustomCondition = (condition) => {
    if (condition && !medicalConditions.includes(condition.label)) {
      setMedicalConditions((prev) => [...prev, condition.label])
    }
    setSearchTerm('')
    setSuggestions([])
    setShowSearch(false)
  }

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus()
    }
  }, [showSearch])

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-blue-800">Medical Conditions</h2>
      <p className="text-gray-600 mb-4">Select any medical conditions that apply:</p>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search for medical conditions..."
                className="w-full p-2 pr-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-150 ease-in-out"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            {suggestions.length > 0 && (
              <ul className="mt-2 bg-white border rounded-md shadow-lg max-h-60 overflow-auto z-10">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.label}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => addCustomCondition(suggestion)}
                  >
                    <span className="text-2xl mr-2">{suggestion.emoji}</span>
                    <span>{suggestion.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {predefinedMedicalConditions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleMedicalCondition(option.id)}
            className={`flex items-center p-4 rounded-lg transition duration-300 ${
              medicalConditions.includes(option.id)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl mr-2">{option.emoji}</span>
            <span className="font-medium">{option.label}</span>
          </motion.button>
        ))}
        
        {/* Render custom medical conditions */}
        {medicalConditions.filter(id => !predefinedMedicalConditions.map(opt => opt.id).includes(id)).map((customCondition) => (
          <motion.button
            key={customCondition}
            className="flex items-center p-4 rounded-lg bg-blue-500 text-white transition duration-300"
          >
            <span className="text-2xl mr-2">🔹</span>
            <span className="font-medium">{customCondition}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}