import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  throw new Error("Missing Gemini API Key")
}

const genAI = new GoogleGenerativeAI(API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { messages, diagnosis } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })

    const prompt = `
      You are an AI assistant specializing in eye health. You have access to the following diagnosis:
      
      ${diagnosis}
      
      Please respond to the user's questions based on this diagnosis and your knowledge of eye health.
      Be friendly, informative, and concise in your responses. Use emojis occasionally to make the conversation more engaging.
      
      Important guidelines:
      1. Do not provide medical advice or diagnoses. Always recommend consulting with an eye care professional for specific medical concerns.
      2. Provide general information about eye health, common eye conditions, and preventive measures.
      3. Engage with the user by asking follow-up questions to better understand their concerns.
      4. Use simple language and explain medical terms when necessary.
      5. Encourage healthy eye care habits and regular check-ups.
      6. If asked about symptoms or conditions not related to eyes, politely redirect the conversation to eye health topics.
      7. Be empathetic and supportive in your responses.
      
      User's message: ${messages[messages.length - 1].content}
    `

    const result = await chat.sendMessage(prompt)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}