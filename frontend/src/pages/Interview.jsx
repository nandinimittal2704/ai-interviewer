import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config.js";

/* ---------------- ROLES ---------------- */

const ROLES = [
  { id: "frontend", label: "Frontend Dev", icon: "⚛️", desc: "React, CSS, JS" },
  { id: "backend", label: "Backend Dev", icon: "⚙️", desc: "Node.js, APIs, DB" },
  { id: "fullstack", label: "Full Stack", icon: "🔗", desc: "End-to-end Dev" },
  { id: "dsa", label: "DSA", icon: "🧮", desc: "Algorithms & DS" },
  { id: "system", label: "System Design", icon: "🏗️", desc: "Architecture" },
  { id: "hr", label: "HR Round", icon: "🤝", desc: "Behavioral" },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const Q_COUNTS = [5, 10, 15];

const GRADE_COLOR = {
  A: "#22c55e",
  B: "#6366f1",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
};

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function Interview() {
  const [screen, setScreen] = useState("setup");
  const [role, setRole] = useState(null);
  const [difficulty, setDiff] = useState("Intermediate");
  const [qCount, setQCount] = useState(5);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [qNum, setQNum] = useState(1);

  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(0);

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const timerRef = useRef(null);
  const recRef = useRef(null);

  const nav = useNavigate();

  /* ---------------- TIMER ---------------- */

  const startTimer = () => {
    setTimer(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const fmt = (t) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(
      2,
      "0"
    )}`;

  /* ---------------- AI VOICE ---------------- */

  const speak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.95;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  /* ---------------- START INTERVIEW ---------------- */

  const startInterview = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/interview/start`,
        { role, difficulty },
        { headers: getHeaders() }
      );

      setQuestion(res.data.question);

      speak(res.data.question);

      setScreen("interview");

      startTimer();
    } catch (err) {
      alert("Error: " + err.message);
    }

    setLoading(false);
  };

  /* ---------------- SUBMIT ANSWER ---------------- */

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);

    clearInterval(timerRef.current);

    window.speechSynthesis.cancel();

    if (recRef.current) {
      recRef.current.stop();
      setListening(false);
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/interview/answer`,
        {
          role,
          difficulty,
          question,
          answer,
          questionNumber: qNum,
          totalQuestions: qCount,
        },
        { headers: getHeaders() }
      );

      const newHistory = [
        ...history,
        {
          question,
          answer,
          score: res.data.score,
          feedback: res.data.feedback,
          correctAnswer: res.data.correctAnswer,
        },
      ];

      setHistory(newHistory);

      setFeedback(res.data);

      speak(
        `Your score is ${res.data.score} out of 10. ${res.data.feedback}`
      );

      if (!res.data.nextQuestion) {
        const reportRes = await axios.post(
          `${API_URL}/api/interview/report`,
          { role, difficulty, history: newHistory },
          { headers: getHeaders() }
        );

        await axios.post(
          `${API_URL}/api/sessions/save`,
          {
            role,
            difficulty,
            totalQuestions: qCount,
            history: newHistory,
            report: reportRes.data,
          },
          { headers: getHeaders() }
        );

        setReport(reportRes.data);

        setScreen("results");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }

    setLoading(false);
  };

  /* ---------------- NEXT QUESTION ---------------- */

  const nextQuestion = () => {
    const nextQ = feedback.nextQuestion;

    setQuestion(nextQ);

    setTimeout(() => speak(nextQ), 400);

    setAnswer("");

    setFeedback(null);

    setQNum((n) => n + 1);

    startTimer();
  };

  /* ---------------- VOICE INPUT ---------------- */

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Use Chrome.");
      return;
    }

    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recRef.current = recognition;

    recognition.lang = "en-US";

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setAnswer((prev) => (prev + " " + transcript).trim());
    };

    recognition.onerror = () => setListening(false);

    recognition.onend = () => setListening(false);

    recognition.start();

    setListening(true);
  };

  /* ---------------- SPEAK BUTTON ---------------- */

  const toggleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      speak(question);
    }
  };

  /* ---------------- PROGRESS ---------------- */

  const progress = ((qNum - 1) / qCount) * 100;

  const roleMeta = ROLES.find((r) => r.id === role);

  /* ---------------- UI ---------------- */

  if (screen === "setup") {
    return (
      <div>
        <h2>Select Interview</h2>

        {ROLES.map((r) => (
          <button key={r.id} onClick={() => setRole(r.id)}>
            {r.icon} {r.label}
          </button>
        ))}

        <button onClick={startInterview} disabled={!role}>
          Start Interview
        </button>
      </div>
    );
  }

  if (screen === "interview") {
    return (
      <div>

        <h3>
          {roleMeta?.label} | {difficulty}
        </h3>

        <p>Timer: {fmt(timer)}</p>

        <p>{question}</p>

        {!feedback && (
          <>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            <button onClick={toggleVoice}>
              {listening ? "Stop Mic" : "Speak"}
            </button>

            <button onClick={submitAnswer}>Submit</button>
          </>
        )}

        {feedback && (
          <>
            <h4>Score: {feedback.score}/10</h4>

            <p>{feedback.feedback}</p>

            <p>{feedback.correctAnswer}</p>

            {feedback.nextQuestion && (
              <button onClick={nextQuestion}>Next Question</button>
            )}
          </>
        )}
      </div>
    );
  }

  if (screen === "results") {
    return (
      <div>
        <h2>Interview Finished</h2>

        <h1 style={{ color: GRADE_COLOR[report?.grade] }}>
          {report?.grade}
        </h1>

        <p>Score: {report?.overallScore}/10</p>

        <button onClick={() => nav("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }
}