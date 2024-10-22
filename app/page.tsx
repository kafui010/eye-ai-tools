'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Symptoms } from './components/Symptoms'
import { EyeSelection } from './components/EyeSelection'
import { OcularHistory } from './components/OcularHistory'
import { MedicalConditions } from './components/MedicalConditions'
import { ImageUpload } from './components/ImageUpload'
import { DiagnosisResult } from './components/DiagnosisResult'
import { AlertCircle } from 'lucide-react'
import { DiagnosisLoading } from './components/DiagnosisLoading'

export default function EyeCareApp() {
  const [step, setStep] = useState(0)
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [selectedEye, setSelectedEye] = useState('')
  const [ocularHistory, setOcularHistory] = useState([])
  const [customHistory, setCustomHistory] = useState('')
  const [medicalConditions, setMedicalConditions] = useState([])
  const [customCondition, setCustomCondition] = useState('')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState('')

  const handleProceed = async () => {
    if (step === 1 && !selectedEye) {
      setShowWarning(true)
      return
    }

    if (step === 4 && !uploadedImage) {
      setShowWarning(true)
      return
    }

    setShowWarning(false)

    if (step === 4) {
      setIsGeneratingDiagnosis(true)
      try {
        const fullOcularHistory = ocularHistory.includes('Others') 
          ? [...ocularHistory.filter(h => h !== 'Others'), customHistory] 
          : ocularHistory

        const fullMedicalConditions = medicalConditions.includes('Others')
          ? [...medicalConditions.filter(c => c !== 'Others'), customCondition]
          : medicalConditions

        const diagnosisResponse = await fetch('/api/generate-diagnosis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symptoms: selectedSymptoms,
            affectedEye: selectedEye,
            ocularHistory: fullOcularHistory,
            medicalConditions: fullMedicalConditions,
            imageUrl: uploadedImage,
          }),
        })

        if (!diagnosisResponse.ok) {
          throw new Error('Failed to generate diagnosis')
        }

        const diagnosisData = await diagnosisResponse.json()
        setDiagnosisResult(diagnosisData.diagnosis)
      } catch (error) {
        console.error("Error generating diagnosis:", error)
        setDiagnosisResult("An error occurred while generating the diagnosis. Please try again.")
      } finally {
        setIsGeneratingDiagnosis(false)
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
    setShowWarning(false)
  }

  const handleRestart = () => {
    setStep(0)
    setSelectedSymptoms([])
    setSelectedEye('')
    setOcularHistory([])
    setCustomHistory('')
    setMedicalConditions([])
    setCustomCondition('')
    setUploadedImage(null)
    setShowWarning(false)
    setDiagnosisResult('')
  }

  const steps = [
    <Symptoms key="symptoms" selectedSymptoms={selectedSymptoms} setSelectedSymptoms={setSelectedSymptoms} />,
    <EyeSelection key="eye-selection" selectedEye={selectedEye} setSelectedEye={setSelectedEye} />,
    <OcularHistory key="ocular-history" ocularHistory={ocularHistory} setOcularHistory={setOcularHistory} customHistory={customHistory} setCustomHistory={setCustomHistory} />,
    <MedicalConditions
      key="medical-conditions"
      medicalConditions={medicalConditions}
      setMedicalConditions={setMedicalConditions}
      customCondition={customCondition}
      setCustomCondition={setCustomCondition}
    />,
    <ImageUpload key="image-upload" selectedEye={selectedEye} setUploadedImage={setUploadedImage} />,
    <DiagnosisResult 
      key="diagnosis-result" 
      diagnosis={diagnosisResult} 
      uploadedImage={uploadedImage} 
      isLoading={isGeneratingDiagnosis}
      onRegenerate={handleRestart}
      onBack={handleBack}
    />,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-2xl"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-blue-800">Eye Care Diagnostic Tool</h1>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md flex items-center"
          >
            <AlertCircle className="mr-2" />
            {step === 1 ? "Please select an affected eye before proceeding." : "Please upload an image before generating the diagnosis."}
          </motion.div>
        )}
        {isGeneratingDiagnosis && <DiagnosisLoading />}
        <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 gap-4">
          {step > 0 && step < steps.length - 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-300"
            >
              Back
            </motion.button>
          )}
          {step < steps.length - 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProceed}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 ml-auto"
              disabled={isGeneratingDiagnosis}
            >
              {step === 4 ? (isGeneratingDiagnosis ? 'Generating...' : 'Generate Diagnosis') : 
 'Next'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}