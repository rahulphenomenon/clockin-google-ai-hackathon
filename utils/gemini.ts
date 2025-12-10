import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { ResumeAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESUME_SCHEMA: Schema = {
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

const QUESTIONS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of interview questions"
    },
    type: {
        type: Type.STRING,
        enum: ["Behavioral", "Technical", "Mixed"],
        description: "The type of interview generated"
    }
  },
  required: ["questions", "type"]
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
        responseSchema: RESUME_SCHEMA,
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

export async function generateInterviewQuestions(
    role: string,
    company: string,
    description: string,
    durationMinutes: number,
    context: string
): Promise<{ questions: string[]; type: 'Behavioral' | 'Technical' | 'Mixed' }> {
    
    // Estimate question count: ~2-3 mins per question + intro/outro
    const questionCount = Math.max(3, Math.floor(durationMinutes / 2.5));

    const prompt = `
        Act as a hiring manager for a ${role} position${company ? ` at ${company}` : ''}.
        ${description ? `Job Description: ${description}` : ''}
        ${context ? `Additional Context: ${context}` : ''}

        Create a list of ${questionCount} interview questions for a ${durationMinutes} minute interview.
        Include a mix of introductory, behavioral, and technical questions appropriate for the role.
        Start with "Tell me about yourself" and end with "Do you have any questions for us?".
        
        Return JSON with the list of questions and the overall type of interview.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: QUESTIONS_SCHEMA
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Question Generation Error:", error);
        throw new Error("Failed to generate interview questions.");
    }
}

export async function generateSpeech(text: string, voice: 'Male' | 'Female'): Promise<string> {
    const voiceName = voice === 'Male' ? 'Puck' : 'Kore';
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: {
                parts: [{ text: text }]
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName }
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned");
        
        return base64Audio;
    } catch (error) {
        console.error("Gemini TTS Error:", error);
        throw new Error("Failed to generate speech.");
    }
}