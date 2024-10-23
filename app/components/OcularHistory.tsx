'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import debounce from 'lodash/debounce'

// Simulated predefined ocular history options
const predefinedOcularHistory = [
  { id: 'surgery', emoji: '🔪', label: 'Eye Surgery' },
  { id: 'spectacles', emoji: '👓', label: 'Wears Spectacles' },
  { id: 'glaucoma', emoji: '🔵', label: 'Glaucoma' },
  { id: 'cataract', emoji: '🌫️', label: 'Cataract' },
  { id: 'lasik', emoji: '🔬', label: 'LASIK' },
  { id: 'others', emoji: '🔍', label: 'Others' },
]

// Simulated API call for ocular health suggestions
const fetchOcularSuggestions = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
  const allPossibleOcularIssues = [
    "Dry Eyes", "Eye Strain", "Floaters", "Glaucoma", "Cataract", 
    "Retinal Detachment", "Macular Degeneration", "Uveitis", 
    "Optic Neuritis", "Conjunctivitis", "Keratitis", "Blepharitis",
    "Stye", "Pterygium", "Color Blindness", "Night Blindness", 
    "Double Vision", "Dry Eye Syndrome", "Visual Disturbance", 
    "Eye Allergy", "Eye Injury", "Contact Lens Issues", 
    "Ocular Migraines", "Eye Fatigue", "Photophobia", 
    "Eye Twitch", "Vision Loss", "Ocular Hypertension", 
    "Retinitis Pigmentosa", "Chemical Burn", "Eye Tumor",
    "Chronic Dry Eye"
  ]
  return allPossibleOcularIssues.filter(issue => 
    issue.toLowerCase().includes(query.toLowerCase())
  )
}

export function OcularHistory({ ocularHistory, setOcularHistory }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef(null)

  const debouncedFetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length > 0) {
        const fetchedSuggestions = await fetchOcularSuggestions(query)
        setSuggestions(fetchedSuggestions)
      } else {
        setSuggestions([])
      }
    }, 300),
    []
  )

  const toggleOcularHistory = (historyId) => {
    if (historyId === 'others') {
      setShowSearch(true)
      return
    }
    setOcularHistory((prev) => {
      if (prev.includes(historyId)) {
        return prev.filter((h) => h !== historyId)
      } else {
        return [...prev, historyId]
      }
    })
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedFetchSuggestions(value)
  }

  const addCustomHistory = (history) => {
    if (history && !ocularHistory.includes(history)) {
      setOcularHistory((prev) => [...prev, history])
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
      <h2 className="text-2xl font-semibold mb-4 text-blue-800">Ocular History</h2>
      <p className="text-gray-600 mb-4">Select any that apply to help us understand your ocular history:</p>

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
                placeholder="Search for ocular issues..."
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
                    key={suggestion}
                    className="p-2 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => addCustomHistory(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Render predefined ocular history options */}
        {predefinedOcularHistory.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleOcularHistory(option.id)}
            className={`flex items-center p-4 rounded-lg transition duration-300 ${
              ocularHistory.includes(option.id)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl mr-2">{option.emoji}</span>
            <span className="font-medium">{option.label}</span>
          </motion.button>
        ))}
        
        {/* Render custom ocular history options */}
        {ocularHistory.filter(id => !predefinedOcularHistory.map(opt => opt.id).includes(id)).map((customHistory) => (
          <motion.button
            key={customHistory}
            className="flex items-center p-4 rounded-lg bg-blue-500 text-white transition duration-300"
          >
            <span className="text-2xl mr-2">🔹</span>
            <span className="font-medium">{customHistory}</span>
          </motion.button>
        ))}
      
      </div>
    </div>
  )
}