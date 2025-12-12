

import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { ResumeAnalysis, AudioAnalysis, ContentAnalysis, TranscriptItem, CoreConcept, QuizQuestion, LearningResource } from "../types";

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

const CORE_CONCEPTS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    concepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Name of the technical concept or term" },
          shortDescription: { type: Type.STRING, description: "1-sentence definition" },
          fullContent: { type: Type.STRING, description: "Detailed technical explanation (approx 100 words)" }
        },
        required: ["title", "shortDescription", "fullContent"]
      }
    }
  },
  required: ["concepts"]
};

const QUIZ_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Array of 4 possible answers"
          },
          correctOptionIndex: { type: Type.NUMBER, description: "0-based index of the correct option" },
          explanation: { type: Type.STRING, description: "Explanation of why the answer is correct" }
        },
        required: ["question", "options", "correctOptionIndex", "explanation"]
      }
    }
  },
  required: ["questions"]
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

// --- Resume Builder Optimization ---

export async function optimizeResumeText(
  currentText: string, 
  sectionType: string, 
  targetRole?: string
): Promise<string> {
  const prompt = `
    You are an expert resume writer and career coach.
    Task: Optimize the following text for a "${sectionType}" section in a professional resume.
    ${targetRole ? `Target Role: ${targetRole}` : ''}
    
    Current Text:
    "${currentText}"
    
    Guidelines:
    1. Improve clarity, impact, and professionalism.
    2. Use strong action verbs.
    3. Quantify achievements where possible or suggest where to add numbers (e.g., [x%]).
    4. Keep it concise and ATS-friendly.
    5. Maintain the original meaning but make it sound more impressive.
    6. Return ONLY the optimized text. Do not add quotes or explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text.trim();
  } catch (error) {
    console.error("Resume Optimization Error:", error);
    throw new Error("Failed to optimize text.");
  }
}

// --- Existing Functions ---

export async function analyzeResume(base64Data: string, targetRoles: string[]): Promise<ResumeAnalysis> {
  // Robustly remove data URI scheme if present (handles any mime type)
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

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
      model: 'gemini-3-pro-preview',
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

export async function generateCoverLetter(
  resumeBase64: string,
  jobDescription: string,
  wordCount?: number
): Promise<string> {
  // cleanup base64
  const cleanBase64 = resumeBase64.includes(',') ? resumeBase64.split(',')[1] : resumeBase64;

  let prompt = `
    Role: Expert Career Coach.
    Task: Write a compelling, professional cover letter for the candidate based on the provided resume and job description.
    
    Job Description:
    ${jobDescription}
    
    Instructions:
    1. Analyze the resume to identify skills and experiences that align with the job description.
    2. Write the letter in the first person.
    3. Use a professional, enthusiastic, and confident tone.
    4. Address specific requirements from the JD where the resume provides evidence of matching skills.
    5. Do not invent experiences not present in the resume.
    6. Return ONLY the body of the cover letter (markdown formatted). Do not include introductory text like "Here is your cover letter".
  `;

  if (wordCount) {
    prompt += `\nConstraint: Keep the length approximately ${wordCount} words.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return text;
  } catch (error) {
    console.error("Cover Letter Generation Error:", error);
    throw new Error("Failed to generate cover letter.");
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
            model: 'gemini-3-pro-preview',
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

export async function generateSpeech(text: string): Promise<string> {
    const voiceName = 'Puck'; // Hardcoded to Male voice as per request
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{
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
        const audioParts = await Promise.all(answerBlobs.map(async (blob) => ({
            inlineData: {
                mimeType: blob.type || 'audio/webm',
                data: await blobToBase64(blob)
            }
        })));

        const parts: any[] = [];
        parts.push({ text: `
            You are an expert interview coach and transcriber.
            I will provide a series of audio files, each corresponding to the candidate's answer to a specific interview question.
            Transcribe the answers VERBATIM and reconstruct the conversation.
            Analyze confidence, clarity, pace, and tone.
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
            contents: { parts: parts },
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
        You are an expert technical interviewer.
        Analyze the following interview transcript for content quality.
        
        TRANSCRIPT:
        ${conversationText}

        Provide a structured JSON evaluation.
        For each question-answer pair found in the transcript, extract the user's answer verbatim, provide feedback, and an improved answer.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
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

// --- Upskill Generator Functions ---

export async function generateCoreConcepts(role: string, resumeText?: string): Promise<CoreConcept[]> {
    const prompt = `
        Generate a list of 20 to 40 core technical concepts, frameworks, or important terminology that are critical for a ${role} position.
        The goal is to help a candidate upskill and identify knowledge gaps.
        Focus heavily on technical depth and specific industry standard terms.
        ${resumeText ? `Tailor this to fill potential gaps given this resume summary: ${resumeText}` : ''}
        
        For each concept, provide:
        1. Title (The technical term)
        2. Short description (1 sentence definition)
        3. Full content (Detailed technical explanation, approx 100 words)
        
        Return the result as a JSON object with a 'concepts' array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: CORE_CONCEPTS_SCHEMA
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        const data = JSON.parse(text);
        return data.concepts.map((c: any) => ({ ...c, id: crypto.randomUUID(), isRead: false }));
    } catch (error) {
        console.error("Core Concepts Generation Error:", error);
        throw new Error("Failed to generate core concepts.");
    }
}

export async function generateQuiz(role: string, company: string, jd: string, count: number): Promise<QuizQuestion[]> {
    const prompt = `
        Create a multiple-choice quiz for a ${role} position${company ? ` at ${company}` : ''}.
        ${jd ? `Based on this job description: ${jd}` : ''}
        
        Generate exactly ${count} questions testing core competencies.
        For each question, provide 4 options, the index of the correct option (0-3), and an explanation.
        
        Return JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: QUIZ_SCHEMA
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        const data = JSON.parse(text);
        return data.questions.map((q: any) => ({ ...q, id: crypto.randomUUID() }));
    } catch (error) {
        console.error("Quiz Generation Error:", error);
        throw new Error("Failed to generate quiz.");
    }
}

export async function generateLearningResources(role: string, resumeContext?: string): Promise<LearningResource[]> {
    const prompt = `
        Find 5-7 high-quality learning resources for a ${role} to improve their skills.
        ${resumeContext ? `Focus on areas that might be missing for this candidate context: ${resumeContext}` : ''}
        
        Include a mix of Books, Courses, Videos, Articles, or Podcasts. Do NOT include any links.
        
        Output the list in the following strictly formatted Markdown list:
        - [Type] Title | Description
        
        Example:
        - [Book] Clean Code | A handbook of agile software craftsmanship.
        - [Course] React - The Complete Guide | Dive in and learn React.js from scratch.
    `;

    try {
        // We use Search Grounding to get real, up-to-date resources
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
                // Note: responseSchema is NOT allowed with tools
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        // Manual Parsing of the Markdown list
        const resources: LearningResource[] = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            // Regex to match: - [Type] Title | Description
            const match = line.match(/^\s*-\s*\[(.*?)\]\s*(.*?)\s*\|\s*(.*)/);
            if (match) {
                resources.push({
                    id: crypto.randomUUID(),
                    type: match[1].trim() as any,
                    title: match[2].trim(),
                    description: match[3].trim(),
                    isCompleted: false
                });
            } else {
                 // Try a simpler format: - [Type] Title: Description
                 const altMatch = line.match(/^\s*-\s*\[(.*?)\]\s*(.*?):\s*(.*)/);
                 if (altMatch) {
                    resources.push({
                        id: crypto.randomUUID(),
                        type: altMatch[1].trim() as any,
                        title: altMatch[2].trim(),
                        description: altMatch[3].trim(),
                        isCompleted: false
                    });
                 }
            }
        });
        
        // Fallback if parsing failed completely
        if (resources.length === 0) {
             console.warn("Regex parsing failed, attempting fallback from grounding chunks");
             const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
             if (chunks) {
                 chunks.forEach(chunk => {
                     if (chunk.web) {
                         resources.push({
                             id: crypto.randomUUID(),
                             type: 'Article',
                             title: chunk.web.title || 'Recommended Resource',
                             description: 'Recommended resource via Google Search',
                             isCompleted: false
                         });
                     }
                 });
             }
        }

        return resources;

    } catch (error) {
        console.error("Resource Generation Error:", error);
        throw new Error("Failed to generate learning resources.");
    }
}

// --- Photo Booth Generation ---

export async function generateProfessionalPhoto(
    base64Image: string,
    setting: string,
    outfit: string,
    pose: string,
    frame: string
): Promise<string> {
    // Robust cleanup to handle different mime types (e.g. data:image/png;base64, or just raw base64)
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    // Extract mime type for inlineData, defaulting to jpeg if unknown
    let mimeType = 'image/jpeg';
    if (base64Image.includes('data:')) {
        const match = base64Image.match(/data:(.*?);base64/);
        if (match) {
            mimeType = match[1];
        }
    }
    
    // Construct a highly detailed prompt for editing
    let prompt = `
        Task: Transform this input image into a high-end, photorealistic professional headshot.
        
        STRICT REQUIREMENTS:
        1. IDENTITY PRESERVATION: The person in the output MUST be the exact same person as in the input image. Strictly preserve their facial features, ethnicity, skin tone, hair color, and age. Do not change who they are.
        2. REALISM: The result must look like a real photograph taken with a professional DSLR camera (85mm portrait lens). 
           - Realistic skin texture (not waxy or plastic).
           - Natural lighting consistent with the setting (softbox or natural).
           - High dynamic range and professional color grading.
    `;
    
    // Logic for framing constraint overrides
    if (frame === 'shoulder') {
         prompt += `\n- Framing/Crop: Shoulder up (Headshot/Passport style). Focus strictly on the face and shoulders.`;
         prompt += `\n- Pose Constraint: Ignore any previous arm/hand positioning instructions. Hands must NOT be visible in the frame. Subject should be facing forward or slightly angled naturally.`;
    } else {
         // Only add pose if not shoulder frame (or if you want to allow it for other frames)
         if (pose && pose !== 'unchanged') {
            prompt += `\n- Pose: Change the person's pose to: ${pose}. Ensure the body language is natural.`;
         }
         
         if (frame && frame !== 'original') {
            prompt += `\n- Framing/Crop: ${frame}. Ensure the composition is balanced.`;
         }
    }
    
    if (outfit && outfit !== 'unchanged') {
        prompt += `\n- Outfit: Change the person's attire to: ${outfit}. The fabric texture and fit must look realistic.`;
    }
    
    if (setting && setting !== 'unchanged') {
        prompt += `\n- Background: Change the background to a ${setting} setting. Apply appropriate depth of field (bokeh) to separate the subject from the background.`;
    }
    
    prompt += `\n\nOutput a 4k resolution, highly detailed, photorealistic image.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Use the "nano banana" model for editing
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: cleanBase64,
                            mimeType: mimeType
                        }
                    },
                    { text: prompt }
                ]
            }
        });

        // Search for the image part in the response
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        
        throw new Error("No image generated.");

    } catch (error) {
        console.error("Photo Booth Generation Error:", error);
        throw new Error("Failed to generate professional photo.");
    }
}