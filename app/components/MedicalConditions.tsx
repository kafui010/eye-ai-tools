import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { debounce } from 'lodash';

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
];

// Extended medical conditions with emojis for suggestions
const allPossibleMedicalConditions = [
  { id: 'copd', emoji: '🌬️', label: 'Chronic Obstructive Pulmonary Disease (COPD)' },
  { id: 'alzheimer', emoji: '🧠', label: "Alzheimer's Disease" },
  { id: 'multiple_sclerosis', emoji: '🧬', label: 'Multiple Sclerosis' },
  { id: 'parkinsons', emoji: '🧑‍🦼', label: "Parkinson's Disease" },
  { id: 'hepatitis', emoji: '🦠', label: 'Hepatitis' },
  { id: 'tuberculosis', emoji: '🦠', label: 'Tuberculosis' },
  { id: 'hiv_aids', emoji: '🧬', label: 'HIV/AIDS' },
  { id: 'anemia', emoji: '🩸', label: 'Anemia' },
  { id: 'kidney_disease', emoji: '🩹', label: 'Kidney Disease' },
  { id: 'liver_disease', emoji: '🫀', label: 'Liver Disease' },
  { id: 'gerd', emoji: '🍽️', label: 'Gastroesophageal Reflux Disease (GERD)' },
  { id: 'ibd', emoji: '🌿', label: 'Inflammatory Bowel Disease (IBD)' },
  { id: 'psoriasis', emoji: '🩹', label: 'Psoriasis' },
  { id: 'eczema', emoji: '🧴', label: 'Eczema' },
  { id: 'osteoporosis', emoji: '🦴', label: 'Osteoporosis' },
  { id: 'sleep_apnea', emoji: '😴', label: 'Sleep Apnea' },
  { id: 'chronic_fatigue', emoji: '😓', label: 'Chronic Fatigue Syndrome' },
  { id: 'dry_eye', emoji: '👁️', label: 'Dry Eye Syndrome' },
  { id: 'vision_loss', emoji: '👁️‍🗨️', label: 'Vision Loss' },
  { id: 'diabetic_retinopathy', emoji: '👁️', label: 'Diabetic Retinopathy' },
  { id: 'celiac', emoji: '🍞', label: 'Celiac Disease' },
  { id: 'acid_reflux', emoji: '🔥', label: 'Acid Reflux' },
  { id: 'depression', emoji: '😞', label: 'Depression' },
  { id: 'anxiety', emoji: '😟', label: 'Anxiety' },
  { id: 'bipolar', emoji: '⚖️', label: 'Bipolar Disorder' },
  { id: 'schizophrenia', emoji: '🧩', label: 'Schizophrenia' },
  { id: 'autism', emoji: '🧩', label: 'Autism Spectrum Disorder' },
  { id: 'ptsd', emoji: '🪖', label: 'Post-Traumatic Stress Disorder (PTSD)' },
  { id: 'fibromyalgia', emoji: '🌀', label: 'Fibromyalgia' },
  { id: 'hypothyroidism', emoji: '🦋', label: 'Hypothyroidism' },
  { id: 'hyperthyroidism', emoji: '🦋', label: 'Hyperthyroidism' },
  { id: 'lupus', emoji: '🛡️', label: 'Lupus' },
  { id: 'rheumatoid_arthritis', emoji: '🦴', label: 'Rheumatoid Arthritis' },
  { id: 'scleroderma', emoji: '🦾', label: 'Scleroderma' },
  { id: 'psoriatic_arthritis', emoji: '🦴', label: 'Psoriatic Arthritis' },
  { id: 'gout', emoji: '🦶', label: 'Gout' },
  { id: 'chronic_kidney_disease', emoji: '🩹', label: 'Chronic Kidney Disease' },
  { id: 'nephrotic_syndrome', emoji: '🩹', label: 'Nephrotic Syndrome' },
  { id: 'hemophilia', emoji: '🩸', label: 'Hemophilia' },
  { id: 'sickle_cell_anemia', emoji: '🩸', label: 'Sickle Cell Anemia' },
  { id: 'thrombosis', emoji: '🩸', label: 'Thrombosis' },
  { id: 'varicose_veins', emoji: '🩸', label: 'Varicose Veins' },
  { id: 'peripheral_artery_disease', emoji: '💓', label: 'Peripheral Artery Disease' },
  { id: 'coronary_artery_disease', emoji: '❤️', label: 'Coronary Artery Disease' },
  { id: 'heart_failure', emoji: '❤️', label: 'Heart Failure' },
  { id: 'arrhythmia', emoji: '💓', label: 'Arrhythmia' },
  { id: 'angina', emoji: '❤️', label: 'Angina' },
  { id: 'hypertrophic_cardiomyopathy', emoji: '❤️', label: 'Hypertrophic Cardiomyopathy' },
  { id: 'congestive_heart_failure', emoji: '❤️', label: 'Congestive Heart Failure' },
  { id: 'pulmonary_embolism', emoji: '💔', label: 'Pulmonary Embolism' },
  { id: 'sleep_disorders', emoji: '😴', label: 'Sleep Disorders' },
  { id: 'chronic_pain', emoji: '😖', label: 'Chronic Pain' },
  { id: 'fibroids', emoji: '🩸', label: 'Uterine Fibroids' },
  { id: 'endometriosis', emoji: '🩸', label: 'Endometriosis' },
  { id: 'polycystic_ovary_syndrome', emoji: '🩸', label: 'Polycystic Ovary Syndrome (PCOS)' },
  { id: 'menstrual_disorders', emoji: '🩸', label: 'Menstrual Disorders' },
  { id: 'prostate_problems', emoji: '👨‍⚕️', label: 'Prostate Problems' },
  { id: 'testicular_cancer', emoji: '🩸', label: 'Testicular Cancer' },
  { id: 'breast_cancer', emoji: '🩸', label: 'Breast Cancer' },
  { id: 'lung_cancer', emoji: '🫁', label: 'Lung Cancer' },
  { id: 'skin_cancer', emoji: '🩹', label: 'Skin Cancer' },
  { id: 'colon_cancer', emoji: '🩹', label: 'Colon Cancer' },
  { id: 'bladder_cancer', emoji: '🩹', label: 'Bladder Cancer' },
  { id: 'kidney_cancer', emoji: '🩹', label: 'Kidney Cancer' },
  { id: 'stomach_cancer', emoji: '🩹', label: 'Stomach Cancer' },
  { id: 'liver_cancer', emoji: '🩹', label: 'Liver Cancer' },
  { id: 'pancreatic_cancer', emoji: '🩹', label: 'Pancreatic Cancer' },
  { id: 'thyroid_cancer', emoji: '🦋', label: 'Thyroid Cancer' },
  { id: 'ovarian_cancer', emoji: '🩸', label: 'Ovarian Cancer' },
  { id: 'cervical_cancer', emoji: '🩸', label: 'Cervical Cancer' },
  { id: 'cognitive_decline', emoji: '🧠', label: 'Cognitive Decline' },
  { id: 'dementia', emoji: '🧠', label: 'Dementia' },
  { id: 'memory_loss', emoji: '🧠', label: 'Memory Loss' },
  { id: 'seizure_disorders', emoji: '⚡', label: 'Seizure Disorders' },
  { id: 'autonomic_dysfunction', emoji: '⚡', label: 'Autonomic Dysfunction' },
  { id: 'migraines', emoji: '🤕', label: 'Migraines' },
  { id: 'tinnitus', emoji: '🔊', label: 'Tinnitus' },
  { id: 'hearing_loss', emoji: '👂', label: 'Hearing Loss' },
  { id: 'vision_impairment', emoji: '👁️', label: 'Vision Impairment' },
  { id: 'allergies', emoji: '🤧', label: 'Allergies' },
  { id: 'asthma', emoji: '🫁', label: 'Asthma' },
  { id: 'hay_fever', emoji: '🤧', label: 'Hay Fever' },
  { id: 'anaphylaxis', emoji: '⚠️', label: 'Anaphylaxis' },
  { id: 'hypersensitivity', emoji: '⚠️', label: 'Hypersensitivity' },
  { id: 'dermatitis', emoji: '🧴', label: 'Dermatitis' },
  { id: 'eczema', emoji: '🧴', label: 'Eczema' },
  { id: 'psoriasis', emoji: '🩹', label: 'Psoriasis' },
  { id: 'acne', emoji: '🧴', label: 'Acne' },
  { id: 'rosacea', emoji: '🌹', label: 'Rosacea' },
  { id: 'hives', emoji: '🔴', label: 'Hives' },
  { id: 'urticaria', emoji: '🔴', label: 'Urticaria' },
  { id: 'candidiasis', emoji: '🦠', label: 'Candidiasis' },
  { id: 'chlamydia', emoji: '🦠', label: 'Chlamydia' },
  { id: 'gonorrhea', emoji: '🦠', label: 'Gonorrhea' },
  { id: 'syphilis', emoji: '🦠', label: 'Syphilis' },
  { id: 'herpes', emoji: '🦠', label: 'Herpes' },
  { id: 'hpv', emoji: '🦠', label: 'HPV' },
  { id: 'hepatitis_a', emoji: '🦠', label: 'Hepatitis A' },
  { id: 'hepatitis_b', emoji: '🦠', label: 'Hepatitis B' },
  { id: 'hepatitis_c', emoji: '🦠', label: 'Hepatitis C' },
  { id: 'chronic_hepatitis', emoji: '🦠', label: 'Chronic Hepatitis' },
  { id: 'viral_infections', emoji: '🦠', label: 'Viral Infections' },
  { id: 'bacterial_infections', emoji: '🦠', label: 'Bacterial Infections' },
  { id: 'fungal_infections', emoji: '🦠', label: 'Fungal Infections' },
  { id: 'parasitic_infections', emoji: '🦠', label: 'Parasitic Infections' },
];

// Simulated API call for medical condition suggestions
const fetchMedicalSuggestions = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return allPossibleMedicalConditions.filter(condition => 
    condition.label.toLowerCase().includes(query.toLowerCase())
  );
};

export function MedicalConditions({ medicalConditions, setMedicalConditions }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);

  const debouncedFetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length > 0) {
        const fetchedSuggestions = await fetchMedicalSuggestions(query);
        setSuggestions(fetchedSuggestions);
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const toggleMedicalCondition = (conditionId) => {
    if (conditionId === 'others') {
      setShowSearch(true);
      return;
    }
    setMedicalConditions((prev) => {
      if (prev.includes(conditionId)) {
        return prev.filter((c) => c !== conditionId);
      } else {
        return [...prev, conditionId];
      }
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchSuggestions(value);
  };

  const addCustomCondition = (condition) => {
    if (condition && !medicalConditions.includes(condition.label)) {
      setMedicalConditions((prev) => [...prev, condition.label]);
    }
    setSearchTerm('');
    setSuggestions([]);
    setShowSearch(false);
  };

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

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
  );
}