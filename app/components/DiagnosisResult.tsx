'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, MessageSquare, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function DiagnosisResult({ diagnosis, uploadedImage, isLoading, onRegenerate, onBack }) {
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const chatEndRef = useRef(null)
  const chatHeaderRef = useRef(null)

  // Scroll to the end of chat messages when they are updated
  useEffect(() => {
    if (showChatInterface && chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, showChatInterface])

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const newMessage = { role: 'user', content: userInput }
    setChatMessages(prevMessages => [...prevMessages, newMessage])
    setUserInput('')
    setIsTyping(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatMessages, newMessage],
          diagnosis: diagnosis,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      setChatMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error sending message:', error)
      setError("I'm sorry, I'm having trouble responding right now. Please try again later. 😔")
    } finally {
      setIsTyping(false)
    }
  }

  const handleChatToggle = () => {
    setShowChatInterface(true)
    setTimeout(() => {
      chatHeaderRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 10);
  }

  const handleCloseChat = () => {
    setShowChatInterface(false)
  }

  const handleRegenerate = () => {
    setChatMessages([]) // Clear messages on regeneration
    onRegenerate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-blue-800">Analyzing your eye health...</p>
        </div>
      </div>
    )
  }

  const formatDiagnosis = (text) => {
    if (!text) return <p className="text-red-500 text-lg font-medium">No diagnosis available. Please try again.</p>

    const sections = text.split('\n\n')
    return sections.map((section, index) => (
      <p key={index} className="text-gray-700 mb-6 text-lg leading-relaxed">{section}</p>
    ))
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-blue-800 text-center">Your Personalized Eye Health Analysis</h2>
      <Card className="mb-8 overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/3 p-6 bg-blue-50">
              {uploadedImage ? (
                <img
                  src={typeof uploadedImage === 'string' ? uploadedImage : URL.createObjectURL(uploadedImage)}
                  alt="Analyzed eye"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No image uploaded</p>
                </div>
              )}
            </div>
            <div className="w-full lg:w-2/3 p-6 lg:p-8">
              <div className="prose max-w-none">
                {diagnosis ? formatDiagnosis(diagnosis) : <p className="text-red-500 text-lg font-medium">No diagnosis available. Please try again.</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-sm text-gray-500 mb-8">
        AI-generated insights to support your eye health journey. For personalized medical advice, please consult with an eye care professional.
      </div>

      {/* Vertical Button Layout */}
      <div className="flex flex-col space-y-4 mb-20">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center justify-center text-lg py-3 px-6 rounded-lg transition duration-300"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </Button>

        <Button
          onClick={handleChatToggle}
          className="flex items-center justify-center text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-300"
        >
          <MessageSquare className="mr-2" size={24} />
          Chat with AI Assistant
        </Button>

        <Button
          onClick={handleRegenerate}
          className="flex items-center justify-center text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-300"
        >
          <RefreshCw className="mr-2" size={20} />
          Regenerate Analysis
        </Button>
      </div>

      <AnimatePresence>
        {showChatInterface && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-hidden backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-lg shadow-2xl w-full h-screen max-w-2xl flex flex-col relative"
            >
              <div ref={chatHeaderRef} className="p-4 sm:p-6 flex-grow overflow-hidden">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="text-2xl font-bold text-blue-800">AI Eye Health Assistant</h3>
                </div>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                  <p className="font-bold">Caution</p>
                  <p>AI may make mistakes. Please use with discretion and consult a healthcare professional for medical advice.</p>
                </div>
                <div className="space-y-4 mb-4 overflow-y-auto h-[calc(100vh-300px)]"> {/* Keep chat area height fixed */}
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === 'user' ? 'bg-blue-200 ml-auto' : 'bg-gray-100'
                      } max-w-[80%] shadow-md`}
                    >
                      <p className={`text-lg ${message.role === 'user' ? 'text-blue-800' : 'text-gray-800'}`}>
                        {message.content}
                      </p>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] shadow-md">
                      <p className="text-gray-500">AI is typing... 🤔</p>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-100 p-3 rounded-lg max-w-[80%] shadow-md">
                      <p className="text-red-500">{error}</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 bg-blue-50">
                <div className="flex items-center bg-white rounded-full shadow-md">
                  <Input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow p-3 bg-transparent focus:outline-none rounded-l-full text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="rounded-r-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Send size={20} />
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseChat}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}