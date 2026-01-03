
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIInsight } from "../types";

export const getFinancialInsights = async (transactions: Transaction[], isAdmin: boolean = false): Promise<AIInsight[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const transactionsContext = transactions.slice(0, 50).map(t => 
    `${t.user_email || 'Visitante'} em ${t.date}: ${t.description} - R$ ${t.amount} (${t.category})`
  ).join('\n');

  const systemInstruction = isAdmin 
    ? "Você é um auditor financeiro master. Analise os gastos de múltiplos usuários da plataforma e identifique tendências globais, categorias com maior inflação de gastos e possíveis anomalias."
    : "Você é um consultor financeiro pessoal. Analise os gastos e dê dicas de economia.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise estes dados:\n${transactionsContext}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
            },
            required: ["title", "description", "recommendation", "severity"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error(error);
    return [];
  }
};
