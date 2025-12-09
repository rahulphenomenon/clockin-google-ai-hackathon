import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Overall resume score out of 100" },
    overview: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A brief 2-sentence summary of the resume quality." },
        strengths: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "List of 3 key strengths" 
        },
        improvements: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING }, 
          description: "List of 3 urgent improvements needed" 
        }
      },
      required: ["summary", "strengths", "improvements"]
    },
    categories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Category name (e.g., ATS Friendliness, Impact, Formatting)" },
          score: { type: Type.NUMBER, description: "Score out of 100 for this category" },
          feedback: { type: Type.STRING, description: "Specific feedback for this category" }
        },
        required: ["name", "score", "feedback"]
      }
    }
  },
  required: ["overallScore", "overview", "categories"]
};

export async function analyzeResume(base64Data: string, targetRoles: string[]): Promise<ResumeAnalysis> {
  // Strip the data URL prefix if present (e.g., "data:application/pdf;base64,")
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");

  const roleContext = targetRoles.length > 0 
    ? `The user is targeting the following roles: ${targetRoles.join(", ")}.` 
    : "The user has not specified target roles, so assume a general professional context.";

  const prompt = `
    You are an expert career coach and resume analyzer. 
    Analyze the attached resume PDF objectively.
    ${roleContext}
    
    Evaluate the resume based on the following criteria:
    1. Impact & Quantifiable Results (Did they achieve things or just do things?)
    2. ATS Friendliness (Is the formatting likely to parse well?)
    3. Skills Match (Do they list relevant skills for the target roles?)
    4. Formatting & Consistency (Is it professional and easy to read?)
    5. Language & Tone (Is it active, professional, and concise?)

    Provide a strict JSON output matching the schema.
    Be critical but constructive.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ResumeAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
}