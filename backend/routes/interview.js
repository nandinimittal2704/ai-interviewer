import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/* =============================
   GEMINI MODEL - INLINE INIT
   (bypasses any getModel() issues)
============================= */
const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });
};

/* =============================
   SAFE JSON PARSER
============================= */
const extractJSON = (text) => {
  try {
    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON found in response: " + cleaned.slice(0, 100));
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (err) {
    console.error("❌ JSON PARSE ERROR:", err.message);
    throw err;
  }
};

/* =============================
   START INTERVIEW
============================= */
router.post("/start", authenticateToken, async (req, res) => {
  try {
    const { role, difficulty } = req.body;

    console.log("📥 START REQUEST:", { role, difficulty });

    if (!role || !difficulty) {
      return res.status(400).json({ message: "role and difficulty are required" });
    }

    const prompt = `You are a professional interviewer. Ask ONE ${difficulty} level interview question for a ${role} developer role. Return only the question text, nothing else.`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const question = result.response.text().trim();

    if (!question) {
      throw new Error("Gemini returned empty question");
    }

    console.log("✅ QUESTION GENERATED:", question.slice(0, 80));
    res.json({ question });

  } catch (err) {
    console.error("❌ START ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* =============================
   ANSWER EVALUATION
============================= */
router.post("/answer", authenticateToken, async (req, res) => {
  try {
    const {
      role,
      difficulty,
      question,
      answer,
      answerTranscript,
      questionNumber,
      totalQuestions,
    } = req.body;

    console.log("📥 ANSWER REQUEST:", { role, difficulty, questionNumber, totalQuestions });

    if (!role || !difficulty || !question) {
      return res.status(400).json({ message: "role, difficulty, and question are required" });
    }

    const userAnswer = (answerTranscript || answer || "").trim();

    if (!userAnswer) {
      return res.status(400).json({ message: "Answer cannot be empty" });
    }

    const isLast = Number(questionNumber) >= Number(totalQuestions);

    const prompt = `
You are an expert ${role} interviewer evaluating a candidate's answer.

Question: "${question}"
Candidate Answer: "${userAnswer}"

Return ONLY a valid JSON object, no markdown, no extra text:

{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentence evaluation>",
  "correctAnswer": "<concise ideal answer>",
  "followUp": "<one follow-up question>",
  "nextQuestion": ${isLast ? "null" : `"<new ${difficulty} level ${role} interview question>"`}
}`.trim();

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    console.log("✅ ANSWER RAW:", raw.slice(0, 120));

    const data = extractJSON(raw);

    if (typeof data.score !== "number") {
      data.score = parseInt(data.score) || 5;
    }
    if (!data.feedback) data.feedback = "No feedback provided.";
    if (!data.correctAnswer) data.correctAnswer = "No model answer provided.";
    if (data.nextQuestion === undefined) data.nextQuestion = null;

    res.json(data);

  } catch (err) {
    console.error("❌ ANSWER ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* =============================
   FINAL REPORT
============================= */
router.post("/report", authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, history } = req.body;

    console.log("📥 REPORT REQUEST:", { role, difficulty, historyLength: history?.length });

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ message: "history array is required" });
    }

    const avgScore =
      history.reduce((sum, h) => sum + (Number(h.score) || 0), 0) / history.length;

    const avg = parseFloat(avgScore.toFixed(1));

    const grade =
      avg >= 9 ? "A" :
      avg >= 7 ? "B" :
      avg >= 5 ? "C" :
      avg >= 3 ? "D" : "F";

    const summary = history
      .map((h, i) => `Q${i + 1}: ${h.question}\nAnswer: ${h.answer || ""}\nScore: ${h.score}/10`)
      .join("\n\n");

    const prompt = `
A candidate completed a ${difficulty} ${role} interview.

${summary}

Average Score: ${avg}/10

Return ONLY a valid JSON object, no markdown:

{
  "overallScore": ${avg},
  "grade": "${grade}",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"],
  "recommendation": "<2 sentence recommendation>",
  "studyTopics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>"]
}`.trim();

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    console.log("✅ REPORT RAW:", raw.slice(0, 120));

    const data = extractJSON(raw);

    data.overallScore = avg;
    data.grade = grade;

    res.json(data);

  } catch (err) {
    console.error("❌ REPORT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;