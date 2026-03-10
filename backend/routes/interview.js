import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/* =============================
   GEMINI MODEL INIT
============================= */

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
      throw new Error("No JSON object found in Gemini response");
    }

    cleaned = cleaned.slice(start, end + 1);
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON PARSE ERROR:", err.message);
    throw err;
  }
};

/* =============================
   START INTERVIEW
============================= */

router.post("/start", authenticateToken, async (req, res) => {
  try {
    const { role, difficulty } = req.body;

    if (!role || !difficulty) {
      return res.status(400).json({ message: "role and difficulty are required" });
    }

    const prompt = `
You are a professional interviewer.

Ask ONE ${difficulty} level interview question for a ${role} role.

Rules:
- Ask only ONE question
- No numbering
- No explanation
- Return only the question text, nothing else
`.trim();

    const model = getModel();
    const result = await model.generateContent(prompt);
    const question = result.response.text().trim();

    if (!question) {
      throw new Error("Gemini returned an empty question");
    }

    console.log("✅ START QUESTION:", question);
    res.json({ question });

  } catch (err) {
    console.error("❌ START ERROR:", err.stack || err.message);
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

Evaluate strictly and fairly.

Return ONLY a valid JSON object with NO markdown, NO extra text:

{
  "score": <integer from 0 to 10>,
  "feedback": "<2-3 sentence constructive evaluation of the candidate's answer>",
  "correctAnswer": "<a concise ideal answer>",
  "followUp": "<one relevant follow-up question>",
  "nextQuestion": ${isLast ? "null" : `"<a new ${difficulty} level ${role} interview question>"`}
}
`.trim();

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    console.log("✅ ANSWER RAW:", raw.slice(0, 150));

    const data = extractJSON(raw);

    // Validate required fields
    if (typeof data.score !== "number") {
      data.score = parseInt(data.score) || 5;
    }
    if (!data.feedback) data.feedback = "No feedback provided.";
    if (!data.correctAnswer) data.correctAnswer = "No model answer provided.";
    if (!data.nextQuestion) data.nextQuestion = null;

    res.json(data);

  } catch (err) {
    console.error("❌ ANSWER ERROR:", err.stack || err.message);
    res.status(500).json({ message: err.message });
  }
});

/* =============================
   FINAL REPORT
============================= */

router.post("/report", authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, history } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ message: "history array is required" });
    }

    const avgScore =
      history.reduce((sum, h) => sum + (Number(h.score) || 0), 0) / history.length;

    const avg = parseFloat(avgScore.toFixed(1));

    // Compute grade on backend (don't trust Gemini for this)
    const grade =
      avg >= 9 ? "A" :
      avg >= 7 ? "B" :
      avg >= 5 ? "C" :
      avg >= 3 ? "D" : "F";

    const summary = history
      .map(
        (h, i) =>
          `Q${i + 1}: ${h.question}\nCandidate Answer: ${h.answer || h.answerTranscript || ""}\nScore: ${h.score}/10`
      )
      .join("\n\n");

    const prompt = `
A candidate just completed a ${difficulty} ${role} developer interview.

Here are all their answers:

${summary}

Overall Average Score: ${avg}/10

Based on their performance, return ONLY a valid JSON object with NO markdown, NO extra text:

{
  "overallScore": ${avg},
  "grade": "${grade}",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>", "<area to improve 3>"],
  "recommendation": "<2 sentence overall recommendation for this candidate>",
  "studyTopics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>"]
}
`.trim();

    const model = getModel();
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    console.log("✅ REPORT RAW:", raw.slice(0, 150));

    const data = extractJSON(raw);

    // Always override with computed values so they're reliable
    data.overallScore = avg;
    data.grade = grade;

    res.json(data);

  } catch (err) {
    console.error("❌ REPORT ERROR:", err.stack || err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;