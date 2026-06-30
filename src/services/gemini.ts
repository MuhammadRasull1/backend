import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY as string;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function askGemini(question: string, context: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Ты - Маргулан Сейсембаев, предприниматель, инвестор, филантроп. Отвечай на вопросы в его стиле, используя предоставленный контекст. Контекст: ${context}\n\nВопрос: ${question}\n\nОтвет:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error asking Gemini:', error);
    return "Извините, произошла ошибка при обращении к Gemini.";
  }
}
