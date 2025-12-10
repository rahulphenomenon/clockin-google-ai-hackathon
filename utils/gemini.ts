import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { ResumeAnalysis, AudioAnalysis, ContentAnalysis, TranscriptItem } from "../types";

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

const AUDIO_ANALYSIS_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        transcript: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, enum: ["AI", "User"] },
                    text: { type: Type.STRING }
                },
                required: ["role", "text"]
            },
            description: "The full conversation transcript, including the interviewer's questions (AI) and candidate's answers (User)."
        },
        audioAnalysis: {
            type: Type.OBJECT,
            properties: {
                confidenceScore: { type: Type.NUMBER, description: "0-100 score on vocal confidence" },
                clarityScore: { type: Type.NUMBER, description: "0-100 score on speech clarity" },
                pace: { type: Type.STRING, description: "Description of speech pace (e.g., Fast, Slow, Moderate)" },
                tone: { type: Type.STRING, description: "Description of tone (e.g., Monotone, Enthusiastic, Nervous)" },
                feedback: { type: Type.STRING, description: "General feedback on the audio characteristics" }
            },
            required: ["confidenceScore", "clarityScore", "pace", "tone", "feedback"]
        }
    },
    required: ["transcript", "audioAnalysis"]
};

const CONTENT_ANALYSIS_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.NUMBER, description: "Overall content score 0-100" },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
        questionFeedback: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    userAnswer: { type: Type.STRING, description: "The VERBATIM answer given by the candidate from the transcript." },
                    score: { type: Type.NUMBER, description: "0-100" },
                    feedback: { type: Type.STRING },
                    improvedAnswer: { type: Type.STRING, description: "An example of a better way to answer this question" }
                },
                required: ["question", "userAnswer", "score", "feedback", "improvedAnswer"]
            }
        }
    },
    required: ["overallScore", "strengths", "improvements", "questionFeedback"]
};

// Helper to convert Blob to Base64
async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data url prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

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
    context: string,
    candidateName: string
): Promise<{ questions: string[]; type: 'Behavioral' | 'Technical' | 'Mixed' }> {
    
    // Estimate question count: ~2-3 mins per question + intro/outro
    const questionCount = Math.max(3, Math.floor(durationMinutes / 2.5));

    const prompt = `
        You are a hiring manager interviewing a candidate named ${candidateName} for a ${role} position${company ? ` at ${company}` : ''}.
        ${description ? `Job Description: ${description}` : ''}
        ${context ? `Additional Context: ${context}` : ''}

        Create a list of ${questionCount} interview questions for a ${durationMinutes} minute interview.
        Ensure all the questions are written in first perspective as the interviewer. Direct the questions to the candidate using "you" and "your", 
        do not frame questions from the perspective of the candidate (e.g. do NOT ask "Tell me about myself", it should be "tell me about yourself").
        Feel free to address the candidate by name (${candidateName}) in the first question (introduction) to make it personal.

        Include a mix of introductory, behavioral, and technical questions appropriate for the role. Follow a traditional interview format given the context, which typically starts with an introduction, asks users about 
        concepts or situations relevant to the role and company, and ends with asking the candidate if they have any questions.
        
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
    const voiceName = voice === 'Male' ? 'Puck' : 'Aoede';
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{
                // Using a direct prompt to ensure verbatim reading instead of systemInstruction
                parts: [{ text: `You are an interviewer interviewing a candidate. Ask/Say this in a professional and polite tone: ${text}` }]
            }],
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
        if (!base64Audio) throw new Error("No audio data returned from Gemini TTS");
        
        return base64Audio;
    } catch (error) {
        console.error("Gemini TTS Error:", error);
        throw new Error("Failed to generate speech. Please try again.");
    }
}

export async function analyzeInterviewAudio(
    answerBlobs: Blob[], 
    questions: string[]
): Promise<{ transcript: TranscriptItem[], audioAnalysis: AudioAnalysis }> {
    try {
        // Convert all blobs to base64
        const audioParts = await Promise.all(answerBlobs.map(async (blob) => ({
            inlineData: {
                mimeType: blob.type || 'audio/webm',
                data: await blobToBase64(blob)
            }
        })));

        // Construct interleaved parts: Text(Q1) -> Audio(A1) -> Text(Q2) -> Audio(A2)...
        const parts: any[] = [];
        
        parts.push({ text: `
            You are an expert interview coach and transcriber.
            I will provide a series of audio files, each corresponding to the candidate's answer to a specific interview question.
            
            Your task:
            1. Transcribe the candidate's answers from the provided audio files VERBATIM. 
            2. Reconstruct the FULL conversation transcript.
               - Insert the Question (Role: AI) from the text I provide.
               - Followed by the Answer (Role: User) transcribed from the corresponding audio file.
            3. Analyze the AUDIO characteristics (Confidence, Clarity, Pace, Tone).
            
            The structure of the inputs below is [Question Text] followed by [Candidate Answer Audio].
        `});

        questions.forEach((question, index) => {
            parts.push({ text: `Question ${index + 1}: ${question}` });
            
            if (audioParts[index]) {
                parts.push({ text: `Answer ${index + 1} Audio:` });
                parts.push(audioParts[index]);
            } else {
                parts.push({ text: `Answer ${index + 1}: [No Audio Recorded]` });
            }
        });
        
        parts.push({ text: "Return a JSON object matching the schema." });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: parts
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: AUDIO_ANALYSIS_SCHEMA
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        return JSON.parse(text);

    } catch (error) {
        console.error("Audio Analysis Error:", error);
        throw new Error("Failed to analyze interview audio.");
    }
}

export async function analyzeInterviewContent(
    transcript: TranscriptItem[]
): Promise<ContentAnalysis> {
    const conversationText = transcript.map(t => `${t.role}: ${t.text}`).join('\n\n');

    const prompt = `
        You are an expert technical interviewer and hiring manager.
        Analyze the following interview transcript for content quality.
        
        TRANSCRIPT:
        ${conversationText}

        Evaluation Criteria:
        1. Relevance: Did they answer the specific question asked?
        2. Depth: Did they provide specific examples (STAR method)?
        3. Technical Accuracy: For technical questions, were they correct?
        4. Structure: Was the answer logical and easy to follow?

        Provide a structured JSON evaluation.
        For each question-answer pair found in the transcript:
        1. 'userAnswer': Copy the candidate's answer VERBATIM from the transcript. Do not summarize or edit it. This field must reflect exactly what the user said.
        2. 'feedback': Provide specific feedback.
        3. 'improvedAnswer': specific example of a better way to answer this question.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: CONTENT_ANALYSIS_SCHEMA
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        return JSON.parse(text);
    } catch (error) {
        console.error("Content Analysis Error:", error);
        throw new Error("Failed to analyze interview content.");
    }
}