import { GoogleGenAI } from "@google/genai";
import { SILVER_CSV, GOLD_CSV } from '../constants';

// We initialize the client inside the function call or check existence to adhere to guidelines
// about strictly using process.env.API_KEY

export const sendMessageToGemini = async (
  userMessage: string,
  history: { role: 'user' | 'model'; text: string }[],
  currentView: string // 'Gold' | 'Silver'
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // We are using gemini-3-flash-preview as it is excellent for reasoning over large contexts quickly.
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
  You are an expert financial commodities analyst.
  You have access to historical price data for Gold and Silver from 1915 to 2025.
  
  CURRENT USER CONTEXT:
  The user is currently viewing the **${currentView}** price chart.
  If the user asks questions like "what is the trend?" or "highest price", strictly refer to the **${currentView}** data unless they explicitly ask for the other metal.
  
  CONTEXT DATA:
  The following is the raw CSV data you must use to answer questions. 
  Each line represents a date (DD/MM/YYYY) and a value (price in USD).
  
  --- SILVER DATA START ---
  ${SILVER_CSV}
  --- SILVER DATA END ---

  --- GOLD DATA START ---
  ${GOLD_CSV}
  --- GOLD DATA END ---

  INSTRUCTIONS:
  1. Answer the user's questions based strictly on the data provided above.
  2. Prioritize the metal currently being viewed (${currentView}).
  3. If the user asks for specific dates, look them up in the data.
  4. If the user asks for trends, analyze the numbers provided.
  5. Be concise but helpful. Use Markdown for formatting (tables, lists, bold text).
  6. The "Value" is the price in USD.
  `;

  // Convert history to Gemini format
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.2, // Lower temperature for more factual answers based on data
      }
    });

    return response.text || "I couldn't generate a response based on the data.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};