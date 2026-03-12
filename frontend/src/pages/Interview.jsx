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

/* ---------------- STYLES ---------------- */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

 .iv-root {
  min-height: 100vh;
  background: #0a0b14;
  color: #e8eaf0;
  font-family: 'DM Sans', sans-serif;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
}

/* AI ripple background */

.iv-root {
  min-height:100vh;
  background:#0a0b14;
  color:#e8eaf0;
  font-family:'DM Sans',sans-serif;
  padding:40px 24px;
  position:relative;
  overflow:hidden;
}

/* AI ripple background */

.lines-bg{
  position:absolute;
  inset:0;

  background:
    radial-gradient(circle at center,
      rgba(0,255,120,0.08) 0px,
      transparent 200px),

    repeating-radial-gradient(
      circle at center,
      rgba(0,255,120,0.05) 0px,
      rgba(0,255,120,0.05) 1px,
      transparent 1px,
      transparent 20px
    );

  opacity:0.7;
  filter:blur(0.5px);
  pointer-events:none;
  z-index:0;
}

.iv-root > *{
  position:relative;
  z-index:1;
}

  .iv-setup { max-width: 860px; margin: 0 auto; }

  .iv-setup-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }

  .iv-setup-header h2 {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, #ffffff 0%, #00ff00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .iv-setup-sub { color: #6b7280; font-size: 14px; margin: 0 0 36px 0; }

  .iv-section-label {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #00ff66;
    margin-bottom: 14px;
  }

  .iv-roles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 32px;
  }

  @media (max-width: 600px) {
    .iv-roles-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .iv-role-card {
    background: #111424;
    border: 1.5px solid #1e2136;
    border-radius: 14px;
    padding: 20px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .iv-role-card:hover { border-color: #00ff66; background: #141729; transform: translateY(-2px); box-shadow: 0 0 20px rgba(0,255,102,0.3); }

  .iv-role-card.active {
    border-color: #00ff66;
    background: linear-gradient(135deg, #1a1d35 0%, #14172a 100%);
    box-shadow: 0 0 0 1px #00ff66, 0 8px 32px rgba(0,255,102,0.25);
  }

  .iv-role-icon { font-size: 26px; margin-bottom: 10px; display: block; }
  .iv-role-label { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #e8eaf0; margin-bottom: 3px; }
  .iv-role-desc { font-size: 12px; color: #6b7280; }

  .iv-row { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
  .iv-row-group { flex: 1; min-width: 180px; }
  .iv-pills { display: flex; gap: 8px; flex-wrap: wrap; }

  .iv-pill {
    background: #111424;
    border: 1.5px solid #1e2136;
    border-radius: 999px;
    padding: 7px 18px;
    font-size: 13px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.18s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .iv-pill:hover { border-color: #00ff66; color: #e8eaf0; }
  .iv-pill.active { background: #00ff66; border-color: #00ff66; color: #000; font-weight: 500; }

  .iv-start-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #00ff66, #00ff00);
    border: none;
    border-radius: 14px;
    color: #000;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.03em;
  }

  .iv-start-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,255,102,0.4); }
  .iv-start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .iv-interview { max-width: 760px; margin: 0 auto; }

  .iv-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; gap: 12px; }
  .iv-topbar-left { display: flex; align-items: center; gap: 10px; }

  .iv-badge {
    background: #1a1d35;
    border: 1px solid #2a2d4a;
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 12px;
    color: #00ff66;
    font-weight: 500;
  }

  .iv-timer {
    background: #111424;
    border: 1px solid #1e2136;
    border-radius: 10px;
    padding: 6px 16px;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #e8eaf0;
    letter-spacing: 0.08em;
  }

  .iv-progress-wrap { margin-bottom: 28px; }
  .iv-progress-info { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 8px; }
  .iv-progress-bar-bg { height: 4px; background: #1e2136; border-radius: 999px; overflow: hidden; }

  .iv-progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ff66, #00ff00);
    border-radius: 999px;
    transition: width 0.5s ease;
  }

  .iv-question-card {
    background: #111424;
    border: 1.5px solid #1e2136;
    border-radius: 18px;
    padding: 28px;
    margin-bottom: 20px;
  }

  .iv-question-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .iv-question-num { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #00ff66; }

  .iv-speak-btn {
    background: #1a1d35;
    border: 1px solid #2a2d4a;
    border-radius: 8px;
    padding: 6px 12px;
    color: #00ff66;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.18s;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .iv-speak-btn:hover { background: #22264a; border-color: #00ff66; }
  .iv-speak-btn.active { background: #00ff66; color: #000; border-color: #00ff66; }

  .iv-question-text { font-size: 16px; line-height: 1.7; color: #d1d5db; margin: 0; }
  .iv-answer-wrap { margin-bottom: 16px; }

  .iv-answer-textarea {
    width: 100%;
    min-height: 150px;
    background: #111424;
    border: 1.5px solid #1e2136;
    border-radius: 14px;
    padding: 16px 18px;
    color: #e8eaf0;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    transition: border-color 0.18s;
    box-sizing: border-box;
  }

  .iv-answer-textarea:focus { border-color: #00ff66; }
  .iv-answer-textarea::placeholder { color: #3d4258; }
  .iv-actions { display: flex; gap: 10px; }

  .iv-mic-btn {
    background: #111424;
    border: 1.5px solid #1e2136;
    border-radius: 12px;
    padding: 12px 20px;
    color: #9ca3af;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.18s;
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: 'DM Sans', sans-serif;
  }

  .iv-mic-btn:hover { border-color: #00ff66; color: #e8eaf0; }

  .iv-mic-btn.listening {
    background: rgba(0,255,102,0.12);
    border-color: #00ff66;
    color: #00ff66;
    animation: pulse 1.5s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,102,0.3); }
    50% { box-shadow: 0 0 0 6px rgba(0,255,102,0); }
  }

  .iv-submit-btn {
    flex: 1;
    background: linear-gradient(135deg, #00ff66, #00ff00);
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    color: #000;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .iv-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,255,102,0.35); }
  .iv-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .iv-feedback-card {
    background: #111424;
    border: 1.5px solid #1e2136;
    border-radius: 18px;
    padding: 24px 28px;
    margin-top: 20px;
  }

  .iv-feedback-score { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }

  .iv-score-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1d35, #141729);
    border: 2px solid #00ff66;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .iv-score-num { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #00ff66; }
  .iv-score-label { font-size: 11px; color: #6b7280; }
  .iv-feedback-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #e8eaf0; margin-bottom: 4px; }
  .iv-feedback-text { font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px 0; }

  .iv-correct-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #22c55e; margin-bottom: 6px; }

  .iv-correct-text {
    font-size: 13px;
    color: #9ca3af;
    line-height: 1.6;
    background: rgba(34, 197, 94, 0.05);
    border: 1px solid rgba(34, 197, 94, 0.15);
    border-radius: 10px;
    padding: 12px 14px;
    margin: 0 0 18px 0;
  }

  .iv-next-btn {
    width: 100%;
    background: linear-gradient(135deg, #00ff66, #00ff00);
    border: none;
    border-radius: 12px;
    padding: 13px;
    color: #000;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .iv-next-btn:hover { box-shadow: 0 6px 24px rgba(0,255,102,0.35); transform: translateY(-1px); }

  .iv-loading-overlay { display: flex; align-items: center; justify-content: center; gap: 10px; color: #6b7280; font-size: 14px; padding: 16px; }

  .iv-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #1e2136;
    border-top-color: #00ff66;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .iv-results { max-width: 600px; margin: 0 auto; text-align: center; }
  .iv-results-icon { font-size: 56px; margin-bottom: 16px; }
  .iv-results-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #e8eaf0; margin: 0 0 8px 0; }
  .iv-results-sub { font-size: 14px; color: #6b7280; margin: 0 0 36px 0; }

  .iv-results-card { background: #111424; border: 1.5px solid #1e2136; border-radius: 22px; padding: 36px; margin-bottom: 24px; }

  .iv-grade-display { font-family: 'Syne', sans-serif; font-size: 80px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
  .iv-results-score { font-size: 18px; color: #9ca3af; margin-bottom: 4px; }
  .iv-results-score span { color: #e8eaf0; font-weight: 600; }
  .iv-results-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 24px; }

  .iv-stat-box { background: #0e1020; border: 1px solid #1e2136; border-radius: 12px; padding: 16px; text-align: center; }
  .iv-stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #00ff66; margin-bottom: 4px; }
  .iv-stat-lbl { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; }

  .iv-back-btn {
    width: 100%;
    background: linear-gradient(135deg, #00ff66, #00ff00);
    border: none;
    border-radius: 14px;
    padding: 15px;
    color: #000;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .iv-back-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35); }

  .iv-history-list { margin-top: 24px; text-align: left; }

  .iv-history-item { background: #0e1020; border: 1px solid #1e2136; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 14px; }
  .iv-history-q { flex: 1; font-size: 13px; color: #9ca3af; line-height: 1.4; }
  .iv-history-score { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #8b8ff8; white-space: nowrap; }
`;

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
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

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

  /* ---------------- ✅ FIXED: toggleSpeak (was missing in old file) ---------------- */
  const toggleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      speak(question);
    }
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
        { role, difficulty, question, answer, questionNumber: qNum, totalQuestions: qCount },
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
      speak(`Your score is ${res.data.score} out of 10. ${res.data.feedback}`);

      if (!res.data.nextQuestion) {
        const reportRes = await axios.post(
          `${API_URL}/api/interview/report`,
          { role, difficulty, history: newHistory },
          { headers: getHeaders() }
        );
        await axios.post(
          `${API_URL}/api/sessions/save`,
          { role, difficulty, totalQuestions: qCount, history: newHistory, report: reportRes.data },
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

  /* ---------------- ✅ FIXED: VOICE INPUT (no more duplicate words) ---------------- */
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

    let committed = answer;

    recognition.onresult = (event) => {
      let interim = "";
      let newCommitted = committed;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newCommitted += " " + event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      committed = newCommitted.trim();
      setAnswer((committed + " " + interim).trim());
    };

    recognition.onerror = () => setListening(false);

    recognition.onend = () => {
      setListening(false);
      setAnswer(committed.trim());
    };

    recognition.start();
    setListening(true);
  };

  /* ---------------- PROGRESS ---------------- */
  const progress = ((qNum - 1) / qCount) * 100;
  const roleMeta = ROLES.find((r) => r.id === role);

  /* ============================================================
     SETUP SCREEN
  ============================================================ */
  if (screen === "setup") {
    return (
      <>
        <style>{styles}</style>
        <div className="iv-root">
          <div className="iv-setup">
            <div className="iv-setup-header">
              <h2>🎯 New Interview</h2>
            </div>
            <p className="iv-setup-sub">Choose your role, difficulty, and question count to begin.</p>

            <div className="iv-section-label">Select Role</div>
            <div className="iv-roles-grid">
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  className={`iv-role-card${role === r.id ? " active" : ""}`}
                  onClick={() => setRole(r.id)}
                >
                  <span className="iv-role-icon">{r.icon}</span>
                  <div className="iv-role-label">{r.label}</div>
                  <div className="iv-role-desc">{r.desc}</div>
                </div>
              ))}
            </div>

            <div className="iv-row">
              <div className="iv-row-group">
                <div className="iv-section-label">Difficulty</div>
                <div className="iv-pills">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      className={`iv-pill${difficulty === d ? " active" : ""}`}
                      onClick={() => setDiff(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="iv-row-group">
                <div className="iv-section-label">Questions</div>
                <div className="iv-pills">
                  {Q_COUNTS.map((q) => (
                    <button
                      key={q}
                      className={`iv-pill${qCount === q ? " active" : ""}`}
                      onClick={() => setQCount(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="iv-start-btn" onClick={startInterview} disabled={!role || loading}>
              {loading ? "Starting..." : "Start Interview →"}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     INTERVIEW SCREEN
  ============================================================ */
  if (screen === "interview") {
    return (
      <>
        <style>{styles}</style>
        <div className="iv-root">
          <div className="iv-interview">
            <div className="iv-topbar">
              <div className="iv-topbar-left">
                <span className="iv-badge">{roleMeta?.icon} {roleMeta?.label}</span>
                <span className="iv-badge">{difficulty}</span>
              </div>
              <div className="iv-timer">⏱ {fmt(timer)}</div>
            </div>

            <div className="iv-progress-wrap">
              <div className="iv-progress-info">
                <span>Question {qNum} of {qCount}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="iv-progress-bar-bg">
                <div className="iv-progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="iv-question-card">
              <div className="iv-question-card-header">
                <span className="iv-question-num">Question {qNum}</span>
                <button
                  className={`iv-speak-btn${speaking ? " active" : ""}`}
                  onClick={toggleSpeak}
                >
                  {speaking ? "🔊 Speaking..." : "🔈 Read Aloud"}
                </button>
              </div>
              <p className="iv-question-text">{question}</p>
            </div>

            {!feedback && (
              <>
                <div className="iv-answer-wrap">
                  <textarea
                    className="iv-answer-textarea"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </div>
                <div className="iv-actions">
                  <button
                    className={`iv-mic-btn${listening ? " listening" : ""}`}
                    onClick={toggleVoice}
                  >
                    {listening ? "🔴 Listening..." : "🎙 Voice Input"}
                  </button>
                  <button
                    className="iv-submit-btn"
                    onClick={submitAnswer}
                    disabled={!answer.trim() || loading}
                  >
                    {loading ? "Evaluating..." : "Submit Answer →"}
                  </button>
                </div>
                {loading && (
                  <div className="iv-loading-overlay">
                    <div className="iv-spinner" />
                    <span>AI is evaluating your answer...</span>
                  </div>
                )}
              </>
            )}

            {feedback && (
              <div className="iv-feedback-card">
                <div className="iv-feedback-score">
                  <div className="iv-score-circle">
                    <span className="iv-score-num">{feedback.score}</span>
                  </div>
                  <div>
                    <div className="iv-feedback-title">Score: {feedback.score}/10</div>
                    <div className="iv-score-label">AI Evaluation Complete</div>
                  </div>
                </div>
                <p className="iv-feedback-text">{feedback.feedback}</p>
                {feedback.correctAnswer && (
                  <>
                    <div className="iv-correct-label">✓ Model Answer</div>
                    <p className="iv-correct-text">{feedback.correctAnswer}</p>
                  </>
                )}
                {feedback.nextQuestion && (
                  <button className="iv-next-btn" onClick={nextQuestion}>
                    Next Question →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     RESULTS SCREEN
  ============================================================ */
  if (screen === "results") {
    const avgScore = history.length
      ? (history.reduce((s, h) => s + h.score, 0) / history.length).toFixed(1)
      : 0;

    return (
      <>
        <style>{styles}</style>
        <div className="iv-root">
          <div className="iv-results">
            <div className="iv-results-icon">🏁</div>
            <h2 className="iv-results-title">Interview Complete!</h2>
            <p className="iv-results-sub">
              Here's how you performed across all {qCount} questions.
            </p>

            <div className="iv-results-card">
              <div
                className="iv-grade-display"
                style={{ color: GRADE_COLOR[report?.grade] || "#6366f1" }}
              >
                {report?.grade || "—"}
              </div>
              <div className="iv-results-score">
                Overall Score: <span>{report?.overallScore ?? avgScore}/10</span>
              </div>

              <div className="iv-results-stats">
                <div className="iv-stat-box">
                  <div className="iv-stat-val">{history.length}</div>
                  <div className="iv-stat-lbl">Questions</div>
                </div>
                <div className="iv-stat-box">
                  <div className="iv-stat-val">{avgScore}</div>
                  <div className="iv-stat-lbl">Avg Score</div>
                </div>
                <div className="iv-stat-box">
                  <div className="iv-stat-val">{difficulty}</div>
                  <div className="iv-stat-lbl">Difficulty</div>
                </div>
                <div className="iv-stat-box">
                  <div className="iv-stat-val">{roleMeta?.icon}</div>
                  <div className="iv-stat-lbl">{roleMeta?.label}</div>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="iv-history-list">
                <div className="iv-section-label" style={{ marginBottom: 12 }}>
                  Question Breakdown
                </div>
                {history.map((h, i) => (
                  <div key={i} className="iv-history-item">
                    <div className="iv-history-q">
                      <strong style={{ color: "#c4c6d8", fontSize: 12 }}>Q{i + 1}:</strong>{" "}
                      {h.question.length > 80 ? h.question.slice(0, 80) + "…" : h.question}
                    </div>
                    <div className="iv-history-score">{h.score}/10</div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="iv-back-btn"
              onClick={() => nav("/dashboard")}
              style={{ marginTop: 24 }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }
}