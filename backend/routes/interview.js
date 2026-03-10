import express from "express";
import { getModel } from "../config/gemini.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();


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
      throw new Error("No JSON found in Gemini response");
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

    const prompt = `
You are a professional interviewer.

Ask ONE ${difficulty} level interview question for a ${role} role.

Rules:
- Ask only ONE question
- No numbering
- No explanation
- Return only the question text
`;

    const model = getModel();

    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (!response) {
      throw new Error("Gemini returned empty response");
    }

    const question = response.text().trim();

    console.log("START QUESTION:", question);

    res.json({ question });

  } catch (err) {

    console.error("START ERROR:", err.stack || err.message);

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
      answerTranscript, // NEW for voice support
      questionNumber,
      totalQuestions
    } = req.body;

    const userAnswer = answerTranscript || answer;

    const isLast = questionNumber >= totalQuestions;

    const prompt = `
You are an expert ${role} interviewer.

Question:
"${question}"

Candidate Answer:
"${userAnswer}"

Evaluate the answer.

Return ONLY valid JSON:

{
 "score": <integer 0-10>,
 "feedback": "<2-3 sentence evaluation>",
 "correctAnswer": "<ideal answer summary>",
 "followUp": "<one follow-up question>",
 "nextQuestion": ${isLast ? "null" : `"<new ${difficulty} ${role} interview question>"`}
}
`;

    const model = getModel();

    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (!response) {
      throw new Error("Gemini returned empty response");
    }

    const raw = response.text();

    console.log("ANSWER RAW:", raw.slice(0, 120));

    const data = extractJSON(raw);

    res.json(data);

  } catch (err) {

    console.error("ANSWER ERROR:", err.stack || err.message);

    res.status(500).json({ message: err.message });

  }

});



/* =============================
   FINAL REPORT
============================= */

router.post("/report", authenticateToken, async (req, res) => {

  try {

    const { role, difficulty, history } = req.body;

    const avgScore =
      history.reduce((sum, h) => sum + h.score, 0) / history.length;

    const avg = avgScore.toFixed(1);

    const summary = history
      .map(
        (h, i) =>
          `Q${i + 1}: ${h.question}
Answer: ${h.answer}
Score: ${h.score}/10`
      )
      .join("\n\n");

    const prompt = `
Candidate completed a ${difficulty} ${role} interview.

Results:

${summary}

Return ONLY JSON:

{
 "overallScore": ${avg},
 "grade": "<A if >=9, B if >=7, C if >=5, D if >=3, F otherwise>",
 "strengths": ["<strength1>", "<strength2>", "<strength3>"],
 "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"],
 "recommendation": "<2 sentence feedback>",
 "studyTopics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>"]
}
`;

    const model = getModel();

    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (!response) {
      throw new Error("Gemini returned empty response");
    }

    const raw = response.text();

    console.log("REPORT RAW:", raw.slice(0, 120));

    const data = extractJSON(raw);

    res.json(data);

  } catch (err) {

    console.error("REPORT ERROR:", err.stack || err.message);

    res.status(500).json({ message: err.message });

  }

});

export default router;