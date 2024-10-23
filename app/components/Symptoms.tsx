'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X } from 'lucide-react'
import debounce from 'lodash/debounce'

const predefinedSymptoms = [
  { id: 'redness', emoji: '🔴', label: 'Redness' },
  { id: 'dryness', emoji: '🏜️', label: 'Dry Eyes' },
  { id: 'sensitivity', emoji: '🔆', label: 'Light Sensitivity' },
  { id: 'blurred', emoji: '🌫️', label: 'Blurred Vision' },
  { id: 'pain', emoji: '😣', label: 'Eye Pain' },
  { id: 'itching', emoji: '🤏', label: 'Itching' },
  { id: 'tearing', emoji: '💧', label: 'Excessive Tearing' },
  { id: 'floaters', emoji: '🕸️', label: 'Floaters' },
  { id: 'headache', emoji: '🤕', label: 'Headache' },
  { id: 'burning', emoji: '🔥', label: 'Burning Sensation' },
  { id: 'discharge', emoji: '💦', label: 'Discharge' },
  { id: 'swelling', emoji: '🎈', label: 'Swelling' },
  { id: 'others', emoji: '🔍', label: 'Others' },
]

// Simulated API call for symptom suggestions
const fetchSymptomSuggestions = async (query: string) => {
  // In a real-world scenario, this would be an API call to a comprehensive medical database
  await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
  const allPossibleSymptoms = [
    "Redness", "Dry Eyes", "Light Sensitivity", "Blurred Vision", "Eye Pain",
    "Itching", "Excessive Tearing", "Floaters", "Headache", "Burning Sensation",
    "Discharge", "Swelling", "Double Vision", "Eye Strain", "Color Blindness",
    "Night Blindness", "Flashes of Light", "Halos Around Lights", "Eye Twitching",
    "Loss of Peripheral Vision", "Cloudy Vision", "Eye Fatigue", "Sensitivity to Glare",
    "Cataracts", "Glaucoma", "Diabetic Retinopathy", "Macular Degeneration",
    "Conjunctivitis", "Stye", "Blepharitis", "Uveitis", "Optic Neuritis",
    "Retinal Detachment", "Corneal Ulcer", "Ocular Migraine", "Astigmatism",
    "Myopia", "Hyperopia", "Presbyopia", "Amblyopia", "Strabismus",
    "Ocular Hypertension", "Retinitis Pigmentosa", "Keratoconus", "Pterygium",
    "Ocular Herpes", "Optic Nerve Damage", "Iritis", "Scleritis", "Orbital Cellulitis"
  ]
  return allPossibleSymptoms.filter(symptom => 
    symptom.toLowerCase().includes(query.toLowerCase())
  )
}

interface SymptomsProps {
  selectedSymptoms: string[]
  setSelectedSymptoms: React.Dispatch<React.SetStateAction<string[]>>
}

export function Symptoms({ selectedSymptoms, setSelectedSymptoms }: SymptomsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [customSymptoms, setCustomSymptoms] = useState<{ id: string; emoji: string; label: string }[]>([])
  const [symptoms, setSymptoms] = useState(predefinedSymptoms)
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length > 0) {
        const fetchedSuggestions = await fetchSymptomSuggestions(query)
        setSuggestions(fetchedSuggestions)
      } else {
        setSuggestions([])
      }
    }, 300),
    []
  )

  const toggleSymptom = (symptomId: string) => {
    if (symptomId === 'others') {
      setShowSearch(true)
      return
    }
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptomId)) {
        return prev.filter((s) => s !== symptomId)
      } else {
        return [...prev, symptomId]
      }
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedFetchSuggestions(value)
  }

  const addCustomSymptom = (symptom: string) => {
    if (symptom && !symptoms.some((s) => s.label.toLowerCase() === symptom.toLowerCase())) {
      const newSymptom = { id: symptom.toLowerCase(), emoji: '🔹', label: symptom }
      setCustomSymptoms((prev) => [...prev, newSymptom])
      setSymptoms((prev) => [...prev, newSymptom])
      toggleSymptom(newSymptom.id)
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
      <h2 className="text-2xl font-semibold mb-4 text-blue-800">What symptoms are you experiencing?</h2>
      <p className="text-gray-600 mb-4">Select all that apply:</p>
      
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
                placeholder="Search for symptoms, diseases, or health problems"
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
              <ul className="mt-2 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="p-2 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => addCustomSymptom(suggestion)}
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
        {symptoms.map((symptom) => (
          <motion.button
            key={symptom.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleSymptom(symptom.id)}
            className={`flex items-center p-4 rounded-lg transition duration-300 ${
              selectedSymptoms.includes(symptom.id)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl mr-2">{symptom.emoji}</span>
            <span className="font-medium">{symptom.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}