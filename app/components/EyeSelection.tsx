import { motion } from 'framer-motion'

export function EyeSelection({ selectedEye, setSelectedEye }) {
  const eyes = [
    { id: 'left eye 👁️', emoji: '👁️', label: 'Left Eye' },
    { id: 'right eye 👁️', emoji: '👁️', label: 'Right Eye' },
    { id: 'both eyes 👀', emoji: '👀', label: 'Both Eyes' },
  ]

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-blue-800">Which eye is affected?</h2>
      <p className="text-gray-600 mb-4">Select the affected eye:</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {eyes.map((eye) => (
          <motion.button
            key={eye.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedEye(eye.id)}
            className={`flex items-center justify-center p-4 rounded-lg transition duration-300 ${
              selectedEye === eye.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl mr-2">{eye.emoji}</span>
            <span className="font-medium">{eye.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}