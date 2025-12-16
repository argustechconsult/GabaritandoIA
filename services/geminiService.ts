import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedContent } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      enum: [
        'Língua Portuguesa', 'Raciocínio Lógico', 'Matemática', 'Informática', 'Atualidades', 'Estatística', 'Inglês',
        'Direito Constitucional', 'Direito Administrativo', 'Direito Penal', 'Direito Processual Penal', 'Direito Civil',
        'Direito Processual Civil', 'Direito do Trabalho', 'Direito Processual do Trabalho', 'Direito Tributário',
        'Direito Previdenciário', 'Direito Empresarial', 'Direito Ambiental', 'Direitos Humanos',
        'Legislação Penal Especial', 'Legislação Tributária', 'Legislação Educacional', 'Legislação Militar', 'Legislação Ambiental',
        'Administração Geral', 'Administração Pública', 'AFO', 'Gestão de Pessoas', 'Arquivologia', 'Ética no Serviço Público',
        'Contabilidade Geral', 'Contabilidade Pública', 'Auditoria', 'Economia', 'Finanças Públicas', 'Matemática Financeira',
        'Criminologia', 'Conhecimentos Bancários', 'Sistema Financeiro Nacional', 'Vendas e Negociação', 'Seguridade Social',
        'Políticas Públicas de Saúde', 'SUS', 'Saúde Pública', 'Epidemiologia', 'Educação (LDB, BNCC, Didática)',
        'Conhecimentos Militares', 'Regulação e Agências', 'Tecnologia da Informação', 'Algoritmos e Programação',
        'Banco de Dados', 'Redes de Computadores', 'Segurança da Informação', 'Engenharia de Software',
        'Física', 'Química', 'História', 'Geografia', 'Filosofia e Sociologia', 'Outros'
      ],
      description: "The main academic subject of the document."
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "answer"],
      },
    },
    mindMap: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        children: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              children: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    children: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                           name: { type: Type.STRING }
                        },
                        required: ["name"]
                      }
                    }
                  },
                  required: ["name"]
                }
              }
            },
            required: ["name"]
          },
        },
      },
      required: ["name", "children"],
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"],
      },
    },
  },
  required: ["subject", "flashcards", "mindMap", "quiz"],
};

export const processPdfContent = async (base64Data: string, mimeType: string): Promise<GeneratedContent> => {
  const totalCards = 40; 
  const maxQuestions = 15;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this document and generate study materials.
            
            1. CLASSIFY the document into the most appropriate Subject from the provided enum list (e.g., 'Direito Constitucional', 'Língua Portuguesa', 'AFO', 'Tecnologia da Informação', etc.).
            2. Create ${totalCards} high-quality flashcards.
            3. Create a hierarchical mind map structure.
            4. Create a Quiz with ${maxQuestions} multiple-choice questions. 
               - Each question must have exactly 5 options.
               - Indicate the index of the correct answer (0-4).
               - Provide a brief explanation.
            
            Return ONLY the JSON matching the schema.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(response.text) as GeneratedContent;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};