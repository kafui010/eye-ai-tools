import { Loader2 } from 'lucide-react'

export function DiagnosisLoading() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Generating Diagnosis...</p>
        <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
      </div>
    </div>
  )
}