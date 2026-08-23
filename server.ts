import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazily initialize Gemini AI client to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it via the 'Secrets' panel in Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API: Submit User Sign Up details to Google Forms
  app.post("/api/submit-google-form", async (req, res) => {
    try {
      const { email, age, name, grade, school, chosedSubject, location, phone } = req.body || {};
      const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc8F-i9ZFCMk_zJqwP5X1Sn_LSu4GxGo28-5WNJmLBP8tDNzQ/formResponse";

      const params = new URLSearchParams();
      if (email) params.append("entry.1476941973", String(email));

      // Name & Age mapping (entry.1699504379)
      if (name && age) {
        params.append("entry.1699504379", `${name} (Age: ${age})`);
      } else if (name) {
        params.append("entry.1699504379", String(name));
      } else if (age) {
        params.append("entry.1699504379", String(age));
      }

      if (grade) params.append("entry.1415919", String(grade));
      if (school) params.append("entry.1724913017", String(school));
      if (chosedSubject) params.append("entry.209629772", String(chosedSubject));
      if (location) params.append("entry.869885082", String(location));
      if (phone) params.append("entry.986575230", String(phone));

      const gfResponse = await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      console.log(`[Google Form Server POST] Status: ${gfResponse.status}`);
      res.json({ success: true, status: gfResponse.status });
    } catch (err: any) {
      console.error("[Google Form Server POST Error]:", err?.message || err);
      res.status(500).json({ success: false, error: err?.message || "Failed to submit to Google Forms" });
    }
  });

  // API: Check if Gemini is configured
  app.get("/api/ai/config-check", (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({
      configured: typeof key === "string" && key.length > 0 && key !== "MY_GEMINI_API_KEY",
    });
  });

  // API: Generate Study Content for a Topic
  app.post("/api/ai/topic", async (req, res) => {
    try {
      const { subjectId, subjectName, topicId, topicName } = req.body;
      if (!subjectName || !topicName) {
        res.status(400).json({ error: "Missing subjectName or topicName" });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `Generate a comprehensive and engaging study guide for the topic "${topicName}" in the subject "${subjectName}" under the CBE (Competency-Based Education) Syllabus.
The study guide should be structured, easy to read, educational, and focused on practical competencies and real-world understanding.
Produce the content matching the exact JSON response schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert e-learning tutor who writes clear, engaging, and pedagogically sound study notes aligned with the CBE (Competency-Based Education) framework. Break down complex ideas into bite-sized analogies, simple concepts, and practical real-world competencies.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A high-quality educational summary of the topic (2-3 paragraphs)." },
              concepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Title of the core sub-concept." },
                    content: { type: Type.STRING, description: "A detailed, plain-English explanation of this concept, complete with a helpful analogy or real-world example." }
                  },
                  required: ["title", "content"]
                },
                description: "A breakdown of 3 to 4 essential sub-concepts required to master this topic."
              },
              takeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 3 key high-level bullet-point takeaways."
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "A clear question or definition prompt (e.g., 'What is photosynthesis?')." },
                    answer: { type: Type.STRING, description: "The concise, clear explanation or answer." }
                  },
                  required: ["question", "answer"]
                },
                description: "A set of 5 interactive flashcard QA pairs for active recall study."
              }
            },
            required: ["summary", "concepts", "takeaways", "flashcards"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini.");
      }

      const data = JSON.parse(responseText);
      res.json({
        subjectId,
        topicId,
        topicName,
        ...data
      });
    } catch (err: any) {
      console.error("Error in /api/ai/topic:", err);
      res.status(500).json({
        error: err.message || "Failed to generate study topic content.",
        hint: !process.env.GEMINI_API_KEY ? "Your Gemini API key is missing. Please configure GEMINI_API_KEY in Settings > Secrets." : undefined
      });
    }
  });

  // API: Generate Quiz for a Topic
  app.post("/api/ai/quiz", async (req, res) => {
    try {
      const { subjectId, subjectName, topicId, topicName } = req.body;
      if (!subjectName || !topicName) {
        res.status(400).json({ error: "Missing subjectName or topicName" });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `Create a 5-question multiple choice quiz on the topic "${topicName}" in the subject "${subjectName}" aligned with CBE (Competency-Based Education) assessments.
The quiz should test different cognitive levels (definition, application, reasoning) and competency-based scenarios.
Ensure questions are highly interactive, clear, and challenging but fair.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional assessment creator specializing in CBE (Competency-Based Education) formats. Your questions are objective, accurate, and have exactly one clearly correct option testing real competencies. The explanations you write must teach the user the correct concept and gently explain why incorrect answers were mistaken.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "A unique id like 'q1', 'q2'..." },
                    question: { type: Type.STRING, description: "The quiz question text." },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly 4 plausible options."
                    },
                    correctOptionIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer (0 to 3)." },
                    explanation: { type: Type.STRING, description: "An informative explanation detailing why the correct option is right and the others are wrong." }
                  },
                  required: ["id", "question", "options", "correctOptionIndex", "explanation"]
                },
                description: "A list of exactly 5 multiple choice questions."
              }
            },
            required: ["questions"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini.");
      }

      const data = JSON.parse(responseText);
      res.json({
        subjectId,
        topicId,
        topicName,
        questions: data.questions
      });
    } catch (err: any) {
      console.error("Error in /api/ai/quiz:", err);
      res.status(500).json({
        error: err.message || "Failed to generate quiz.",
        hint: !process.env.GEMINI_API_KEY ? "Your Gemini API key is missing. Please configure GEMINI_API_KEY in Settings > Secrets." : undefined
      });
    }
  });

  // API: Generate Custom Subject topics list
  app.post("/api/ai/custom-subject", async (req, res) => {
    try {
      const { name, grade } = req.body;
      if (!name) {
        res.status(400).json({ error: "Missing custom subject name" });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `The user wants to study a custom subject named "${name}" tailored for Grade ${grade || 7} under the CBE (Competency-Based Education) Syllabus (scale of Grade 1 to Grade 9).
Please clean up the name if there are typos, write a friendly, encouraging summary description, and outline exactly 4 study topics that make a comprehensive, age-appropriate learning roadmap for a student in Grade ${grade || 7} under the CBE curriculum.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are a master school curriculum planner specializing in the CBE (Competency-Based Education) Syllabus. You break down any complex, specialized, or school subject into exactly 4 logical, sequential, and age-appropriate learning topics and competencies for a student in Grade ${grade || 7}.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The properly formatted, cleaned name of the subject." },
              description: { type: Type.STRING, description: "A friendly, inspiring 1-2 sentence overview of what the user will learn in this subject." },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "A unique slug, alphanumeric lower-case (e.g. 'intro-to-quantum')" },
                    name: { type: Type.STRING, description: "A concise name of the topic" },
                    description: { type: Type.STRING, description: "A one-sentence teaser of what this specific topic teaches." }
                  },
                  required: ["id", "name", "description"]
                },
                description: "Exactly 4 key topics forming a cohesive syllabus."
              }
            },
            required: ["name", "description", "topics"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini.");
      }

      const data = JSON.parse(responseText);
      res.json({
        id: `custom-${Date.now()}`,
        name: data.name,
        description: data.description,
        iconName: "GraduationCap",
        topics: data.topics,
        isCustom: true
      });
    } catch (err: any) {
      console.error("Error in /api/ai/custom-subject:", err);
      res.status(500).json({
        error: err.message || "Failed to create custom subject roadmap.",
        hint: !process.env.GEMINI_API_KEY ? "Your Gemini API key is missing. Please configure GEMINI_API_KEY in Settings > Secrets." : undefined
      });
    }
  });

  // API: Generate Daily Practice Challenge
  app.post("/api/ai/daily-practice", async (req, res) => {
    try {
      const { date } = req.body;
      const targetDate = date || new Date().toISOString().split("T")[0];

      const ai = getGeminiClient();
      const prompt = `Generate an inspiring Daily Practice exercise for date ${targetDate}.
Pick a fascinating real-world study nugget, cognitive model, mathematical shortcut, scientific phenomenon, or critical thinking technique to introduce as 'conceptIntro'.
Then write exactly 2-3 multiple-choice practice questions directly testing that concept.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the creator of 'Daily Brain Spark', a popular micro-learning daily newsletter. You explain one neat, high-utility concept very quickly and test it immediately to build a satisfying active study habit.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "An exciting title (e.g. 'The Feynman Technique', 'Speed Squaring Math Trick')." },
              conceptIntro: { type: Type.STRING, description: "A neat 3-4 sentence explanation introducing this useful cognitive model or trick." },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "q1, q2, q3" },
                    question: { type: Type.STRING, description: "The practice question." },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exactly 4 multiple choice options."
                    },
                    correctOptionIndex: { type: Type.INTEGER, description: "The correct option index (0 to 3)." },
                    explanation: { type: Type.STRING, description: "Quick, friendly explanation showing the step-by-step resolution." }
                  },
                  required: ["id", "question", "options", "correctOptionIndex", "explanation"]
                },
                description: "Exactly 2 to 3 multi-choice practice questions testing the lesson."
              }
            },
            required: ["title", "conceptIntro", "questions"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini.");
      }

      const data = JSON.parse(responseText);
      res.json({
        id: `daily-${targetDate}`,
        date: targetDate,
        title: data.title,
        conceptIntro: data.conceptIntro,
        questions: data.questions
      });
    } catch (err: any) {
      console.error("Error in /api/ai/daily-practice:", err);
      res.status(500).json({
        error: err.message || "Failed to generate daily practice.",
        hint: !process.env.GEMINI_API_KEY ? "Your Gemini API key is missing. Please configure GEMINI_API_KEY in Settings > Secrets." : undefined
      });
    }
  });

  // API: AI Tutor Chat (Explanation & Q&A)
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { topicName, question, context } = req.body;
      if (!question) {
        res.status(400).json({ error: "Missing question" });
        return;
      }

      const ai = getGeminiClient();
      let prompt = `Topic context: ${topicName || "General Learning"}\n`;
      if (context) {
        prompt += `Specific lesson content context:\n${context}\n`;
      }
      prompt += `Student Question: "${question}"\n\nPlease answer the student in a supportive, encouraging, and extremely clear manner. Use simple analogies, formatting like bullet points or bold text where helpful, and keep it pedagogical. Keep it around 150-250 words unless more detail is absolutely needed.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are 'Socrates AI', a patient, witty, and exceptionally clear academic tutor specializing in the CBE (Competency-Based Education) Syllabus. You never give just boring formulas; you teach with lightheartedness, real-world analogies, focus on competencies, and prompt active thinking by closing with an encouraging rhetorical prompt or quiz-like self-check.",
        }
      });

      res.json({
        text: response.text || "I'm sorry, I couldn't process your request. Could you please ask that again?"
      });
    } catch (err: any) {
      console.error("Error in /api/ai/explain:", err);
      res.status(500).json({
        error: err.message || "Failed to contact AI Tutor.",
        hint: !process.env.GEMINI_API_KEY ? "Your Gemini API key is missing. Please configure GEMINI_API_KEY in Settings > Secrets." : undefined
      });
    }
  });

  // Vite middleware for development or Static server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
