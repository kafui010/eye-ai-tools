'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, Eye, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function DiagnosisResult({ diagnosis, uploadedImage, isLoading, onRegenerate, onBack }) {
  const [showViewBreakdown, setShowViewBreakdown] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const newMessage = { role: 'user', content: userInput }
    setChatMessages(prevMessages => [...prevMessages, newMessage])
    setUserInput('')
    setIsTyping(true)

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
      setChatMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "I'm sorry, I'm having trouble responding right now. Please try again later." }])
    } finally {
      setIsTyping(false)
    }
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
    return sections.map((section, index) => {
      if (section.startsWith('Symptom Interpretation:') || section.startsWith('Recommendations:')) {
        const [title, ...content] = section.split('\n')
        return (
          <div key={index} className="mb-8">
            <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <CheckCircle className="mr-2 text-blue-500" size={24} />
              {title}
            </h3>
            <ul className="space-y-3">
              {content.map((line, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700 text-lg leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      }
      return <p key={index} className="text-gray-700 mb-6 text-lg leading-relaxed">{section}</p>
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowViewBreakdown(true)}
                  className="flex items-center justify-center text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                >
                  <Eye className="mr-2" size={24} />
                  View Detailed Analysis
                </Button>
                <Button
                  onClick={() => setShowChatInterface(true)}
                  className="flex items-center justify-center text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                >
                  <MessageSquare className="mr-2" size={24} />
                  Chat with AI Assistant
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-sm text-gray-500 mb-8">
        AI-generated insights to support your eye health journey. For personalized medical advice, please consult with an eye care professional.
      </div>
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center justify-center text-lg py-3 px-6 rounded-lg transition duration-300"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </Button>
        <Button
          onClick={onRegenerate}
          className="flex items-center justify-center text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
        >
          <RefreshCw className="mr-2" size={20} />
          Regenerate Analysis
        </Button>
      </div>
      <AnimatePresence>
        {showViewBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-3xl font-bold mb-6 text-blue-800">Your Eye Health Journey</h3>
              <div className="space-y-6 text-lg leading-relaxed">
                <section>
                  <h4 className="text-2xl font-semibold mb-3 text-blue-700">Understanding Your Eyes</h4>
                  <p className="text-gray-700">Your eyes are remarkable organs, working tirelessly to help you perceive the world. They're composed of intricate parts like the cornea, iris, lens, and retina, each playing a crucial role in your vision.</p>
                </section>
                
                <section>
                  <h4 className="text-2xl font-semibold mb-3 text-blue-700">Decoding Your Symptoms</h4>
                  <p className="text-gray-700">The symptoms you've shared provide valuable clues about your eye health. Remember, early awareness and action are key to maintaining healthy vision and preventing potential issues from progressing.</p>
                </section>
                
                <section>
                  <h4 className="text-2xl font-semibold mb-3 text-blue-700">Lifestyle for Healthy Eyes</h4>
                  <p className="text-gray-700">Your daily habits can significantly impact your eye health. Consider these friendly tips:</p>
                  <ul className="list-disc pl-6 mt-2 text-gray-700">
                    <li>Nourish your eyes with a diet rich in vitamins A, C, and E</li>
                    <li>Stay hydrated and ensure you're getting enough restful sleep</li>
                    <li>Give your eyes regular breaks when using digital devices (try the 20-20-20 rule)</li>
                    <li>Shield your eyes from harmful UV rays with quality sunglasses</li>
                  </ul>
                </section>
                
                <section>
                  <h4 className="text-2xl font-semibold mb-3 text-blue-700">Your Next Steps</h4>
                  <p className="text-gray-700">While this analysis provides valuable insights, partnering with an eye care professional for a comprehensive examination is your best next step. They can offer personalized advice and treatment options tailored just for you, ensuring your vision stays clear and healthy for years to come.</p>
                </section>
              </div>
              <Button 
                onClick={() => setShowViewBreakdown(false)} 
                className="mt-6 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
        {showChatInterface && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full h-[80vh] flex flex-col"
            >
              <h3 className="text-2xl font-bold mb-4 text-blue-800">Chat with AI Assistant</h3>
              <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-4 bg-gray-100 rounded-lg">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white'
                    } max-w-[80%] shadow`}
                  >
                    <p className={`text-sm ${message.role === 'user' ? 'text-blue-800' : 'text-gray-800'}`}>
                      {message.content}
                    </p>
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-white p-3 rounded-lg max-w-[80%] shadow">
                    <p className="text-gray-500">AI is typing...</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex items-center bg-white rounded-full shadow-md">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow p-3 bg-transparent focus:outline-none rounded-l-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  className="rounded-r-full bg-blue-600 hover:bg-blue-700"
                >
                  <Send size={20} />
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowChatInterface(false)}
                className="mt-4"
              >
                Close Chat
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}