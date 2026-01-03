import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIInsight } from "../types";

export const getFinancialInsights = async (transactions: Transaction[]): Promise<AIInsight[]> => {
  // Use process.env.API_KEY directly for initialization as required by guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const transactionsContext = transactions.map(t => 
    `${t.date}: ${t.description} - R$ ${t.amount} (${t.category} - ${t.type})`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise as seguintes transações financeiras e forneça 3 insights ou recomendações para economizar ou gerenciar melhor o dinheiro. Retorne em formato JSON.
      Transações:
      ${transactionsContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título curto do insight" },
              description: { type: Type.STRING, description: "Explicação detalhada" },
              recommendation: { type: Type.STRING, description: "Ação sugerida" },
              severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
            },
            required: ["title", "description", "recommendation", "severity"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return [{
      title: "Erro ao gerar insights",
      description: "Não foi possível conectar com o analista virtual no momento.",
      recommendation: "Tente novamente mais tarde.",
      severity: "low"
    }];
  }
};