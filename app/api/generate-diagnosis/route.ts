import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { symptoms, affectedEye, ocularHistory, medicalConditions, imageUrl } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      Analyze the following eye-related information and provide a detailed diagnosis:
      
      Affected Eye: ${affectedEye}
      Symptoms: ${symptoms.join(', ')}
      Ocular History: ${ocularHistory.join(', ')}
      Medical Conditions: ${medicalConditions.join(', ')}
      
      Based on this information and the uploaded eye image, provide:
      1. A possible diagnosis
      2. Explanation of the condition
      3. Potential causes
      4. Recommended next steps or treatments
      5. Any additional relevant information
    `;

    const imagePart = {
      inlineData: {
        data: imageUrl.split(',')[1],
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const diagnosis = result.response.text();

    return NextResponse.json({ diagnosis });
  } catch (error) {
    console.error('Error generating diagnosis:', error);
    return NextResponse.json({ error: 'Failed to generate diagnosis' }, { status: 500 });
  }
}