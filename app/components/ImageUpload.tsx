'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ImageUpload({ selectedEye, setUploadedImage }) {
  const [dragActive, setDragActive] = useState(false)
  const [scanningActive, setScanningActive] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const inputRef = useRef(null)
  const videoRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0])
    }
  }

  const handleFiles = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target.result)
      setUploadedImage(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const onButtonClick = () => {
    inputRef.current.click()
  }

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      videoRef.current.srcObject = stream
      videoRef.current.play()
      setScanningActive(true)
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const captureImage = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const imageDataUrl = canvas.toDataURL('image/jpeg')
    setPreviewImage(imageDataUrl)
    setUploadedImage(imageDataUrl)
    setScanningActive(false)
    videoRef.current.srcObject.getTracks().forEach(track => track.stop())
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-blue-800">Upload Eye Image</h2>
      <p className="text-gray-600 mb-4">Please upload an image of your {selectedEye || 'affected eye'}:</p>
      <Card>
        <CardContent className="p-6">
          {!scanningActive && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
              {previewImage ? (
                <img src={previewImage} alt="Uploaded eye" className="mx-auto max-h-48 rounded-lg" />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <p className="mt-2 text-sm text-gray-600">Drag and drop your image here, or click to select</p>
              <Button
                onClick={onButtonClick}
                className="mt-4"
              >
                Select Image
              </Button>
            </div>
          )}
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Or use our advanced retina/iris scanning tool:</p>
            {scanningActive ? (
              <div className="relative">
                <video ref={videoRef} className="w-full rounded-lg" />
                <Button
                  onClick={captureImage}
                  className="mt-4"
                >
                  Capture Image
                </Button>
              </div>
            ) : (
              <Button
                onClick={startScanning}
                className="flex items-center justify-center"
              >
                <Camera className="mr-2" size={20} />
                Start Retina/Iris Scan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}