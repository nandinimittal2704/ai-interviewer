import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config.js";

const ROLES = [
  { id: "frontend", label: "Frontend Dev", icon: "", desc: "React, CSS, JS" },
  { id: "backend", label: "Backend Dev", icon: "", desc: "Node.js, APIs, DB" },
  { id: "fullstack", label: "Full Stack", icon: "", desc: "End-to-end Dev" },
  { id: "dsa", label: "DSA", icon: "", desc: "Algorithms & DS" },
  { id: "system", label: "System Design", icon: "", desc: "Architecture" },
  { id: "hr", label: "HR Round", icon: "", desc: "Behavioral" },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const Q_COUNTS = [5, 10, 15];

const GRADE_COLOR = {
  A: "#00ff7f", B: "#00cc66", C: "#f59e0b", D: "#f97316", F: "#ef4444",
};

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ─── STYLES ─── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Satoshi:wght@300;400;500;700&display=swap');

:root {
  --green: #00ff7f;
  --green-dim: #00cc66;
  --green-glow: rgba(0,255,127,0.15);
  --green-border: rgba(0,255,127,0.2);
  --bg: #030705;
  --bg-card: rgba(255,255,255,0.03);
  --surface: #080f0a;
  --surface2: #0d160f;
  --border: rgba(255,255,255,0.07);
  --text: #edf5ef;
  --text-muted: #6b8070;
  --text-dim: #3a4a3e;
  --radius: 16px;
}

.iv-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Satoshi', sans-serif;
  padding: 48px 24px;
  position: relative;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Grid background */
.iv-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,255,127,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,127,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 30%, transparent);
}

/* Top glow */
.iv-root::after {
  content: '';
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 500px;
  background: radial-gradient(circle, rgba(0,255,127,0.06), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.iv-root > * { position: relative; z-index: 1; }

/* ── SETUP ── */
.iv-setup { max-width: 880px; margin: 0 auto; }

.iv-page-header { margin-bottom: 40px; }

.iv-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 10px;
}

.iv-page-title {
  font-family: 'Clash Display', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.iv-page-sub {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
}

.iv-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.iv-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ROLES GRID */
.iv-roles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 36px;
}

@media (max-width: 640px) {
  .iv-roles-grid { grid-template-columns: repeat(2, 1fr); }
}

.iv-role-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px 18px;
  cursor: pointer;
  transition: all 0.22s ease;
  position: relative;
  overflow: hidden;
}

.iv-role-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, var(--green-glow), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.iv-role-card:hover::before { opacity: 1; }

.iv-role-card:hover {
  border-color: var(--green-border);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,255,127,0.1);
}

.iv-role-card.active {
  border-color: var(--green);
  background: var(--surface2);
  box-shadow: 0 0 0 1px var(--green-border), 0 12px 40px rgba(0,255,127,0.12);
}

.iv-role-card.active::before { opacity: 1; }

.iv-role-icon { font-size: 28px; margin-bottom: 12px; display: block; }

.iv-role-label {
  font-family: 'Clash Display', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.iv-role-desc { font-size: 12px; color: var(--text-muted); }

.iv-role-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #000;
  font-weight: 700;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s;
}

.iv-role-card.active .iv-role-check {
  opacity: 1;
  transform: scale(1);
}

/* OPTIONS ROW */
.iv-options-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 36px;
}

@media (max-width: 500px) {
  .iv-options-row { grid-template-columns: 1fr; }
}

.iv-option-group { }

.iv-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.iv-pill {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.18s;
  font-family: 'Satoshi', sans-serif;
}

.iv-pill:hover { border-color: var(--green-border); color: var(--text); }

.iv-pill.active {
  background: var(--green);
  border-color: var(--green);
  color: #000;
  font-weight: 700;
}

/* START BUTTON */
.iv-start-btn {
  width: 100%;
  padding: 17px;
  background: var(--green);
  border: none;
  border-radius: var(--radius);
  color: #000;
  font-family: 'Clash Display', sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.iv-start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,255,127,0.35);
}

.iv-start-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── INTERVIEW ── */
.iv-interview { max-width: 780px; margin: 0 auto; }

.iv-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 12px;
}

.iv-topbar-left { display: flex; align-items: center; gap: 8px; }

.iv-badge {
  background: var(--surface);
  border: 1px solid var(--green-border);
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--green);
  letter-spacing: 0.03em;
}

.iv-timer {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 7px 16px;
  font-family: 'Clash Display', sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.1em;
}

/* PROGRESS */
.iv-progress-wrap { margin-bottom: 28px; }

.iv-progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
  font-weight: 500;
}

.iv-progress-bar-bg {
  height: 3px;
  background: var(--surface2);
  border-radius: 999px;
  overflow: hidden;
}

.iv-progress-bar-fill {
  height: 100%;
  background: var(--green);
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 8px rgba(0,255,127,0.4);
}

/* QUESTION CARD */
.iv-question-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.iv-question-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--green), transparent);
}

.iv-question-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.iv-question-num {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--green);
}

.iv-speak-btn {
  background: rgba(0,255,127,0.06);
  border: 1px solid var(--green-border);
  border-radius: 8px;
  padding: 6px 14px;
  color: var(--green);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Satoshi', sans-serif;
}

.iv-speak-btn:hover { background: rgba(0,255,127,0.1); }
.iv-speak-btn.active { background: var(--green); color: #000; border-color: var(--green); }

.iv-question-text {
  font-size: 17px;
  line-height: 1.75;
  color: var(--text);
  margin: 0;
  font-weight: 400;
}

/* ANSWER */
.iv-answer-wrap { margin-bottom: 14px; }

.iv-answer-textarea {
  width: 100%;
  min-height: 160px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
  color: var(--text);
  font-family: 'Satoshi', sans-serif;
  font-size: 15px;
  line-height: 1.65;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.iv-answer-textarea:focus {
  border-color: var(--green-border);
  box-shadow: 0 0 0 3px rgba(0,255,127,0.05);
}

.iv-answer-textarea::placeholder { color: var(--text-dim); }

.iv-actions { display: flex; gap: 10px; }

.iv-mic-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 22px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Satoshi', sans-serif;
  white-space: nowrap;
}

.iv-mic-btn:hover { border-color: var(--green-border); color: var(--text); }

.iv-mic-btn.listening {
  background: rgba(0,255,127,0.08);
  border-color: var(--green);
  color: var(--green);
  animation: mic-pulse 1.8s ease infinite;
}

@keyframes mic-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,255,127,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(0,255,127,0); }
}

.iv-submit-btn {
  flex: 1;
  background: var(--green);
  border: none;
  border-radius: 12px;
  padding: 12px 26px;
  color: #000;
  font-family: 'Clash Display', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.03em;
}

.iv-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(0,255,127,0.3);
}

.iv-submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* FEEDBACK */
.iv-feedback-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px 30px;
  margin-top: 20px;
  position: relative;
  overflow: hidden;
}

.iv-feedback-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--green), transparent);
}

.iv-feedback-score { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; }

.iv-score-circle {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(0,255,127,0.06);
  border: 2px solid var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(0,255,127,0.15);
}

.iv-score-num {
  font-family: 'Clash Display', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--green);
}

.iv-score-title {
  font-family: 'Clash Display', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
}

.iv-score-label { font-size: 12px; color: var(--text-muted); }

.iv-feedback-text { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin: 0 0 18px 0; }

.iv-correct-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.iv-correct-text {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  background: rgba(0,255,127,0.04);
  border: 1px solid rgba(0,255,127,0.12);
  border-left: 3px solid var(--green);
  border-radius: 10px;
  padding: 14px 16px;
  margin: 0 0 20px 0;
}

.iv-next-btn {
  width: 100%;
  background: var(--green);
  border: none;
  border-radius: 12px;
  padding: 14px;
  color: #000;
  font-family: 'Clash Display', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.03em;
}

.iv-next-btn:hover {
  box-shadow: 0 8px 28px rgba(0,255,127,0.3);
  transform: translateY(-1px);
}

/* LOADING */
.iv-loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 13px;
  padding: 18px;
  font-weight: 500;
}

.iv-spinner {
  width: 18px; height: 18px;
  border: 2px solid var(--surface2);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── RESULTS ── */
.iv-results { max-width: 640px; margin: 0 auto; text-align: center; }

.iv-results-icon { font-size: 52px; margin-bottom: 12px; }

.iv-results-title {
  font-family: 'Clash Display', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.iv-results-sub { font-size: 15px; color: var(--text-muted); margin: 0 0 36px 0; }

.iv-results-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.iv-results-card::before {
  content: '';
  position: absolute;
  top: -80px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 200px;
  background: radial-gradient(circle, rgba(0,255,127,0.07), transparent 70%);
  pointer-events: none;
}

.iv-grade-display {
  font-family: 'Clash Display', sans-serif;
  font-size: 96px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 10px;
  text-shadow: 0 0 40px currentColor;
}

.iv-results-score { font-size: 17px; color: var(--text-muted); margin-bottom: 6px; }
.iv-results-score span { color: var(--text); font-weight: 700; }

.iv-results-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 28px;
}

.iv-stat-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  text-align: center;
  transition: border-color 0.2s;
}

.iv-stat-box:hover { border-color: var(--green-border); }

.iv-stat-val {
  font-family: 'Clash Display', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--green);
  margin-bottom: 4px;
}

.iv-stat-lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }

.iv-history-list { margin-top: 20px; text-align: left; }

.iv-history-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color 0.2s;
}

.iv-history-item:hover { border-color: var(--green-border); }

.iv-history-q { flex: 1; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
.iv-history-q strong { color: var(--green); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; }

.iv-history-score {
  font-family: 'Clash Display', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--green);
  white-space: nowrap;
  background: rgba(0,255,127,0.08);
  border: 1px solid var(--green-border);
  border-radius: 8px;
  padding: 4px 10px;
}

.iv-back-btn {
  width: 100%;
  background: var(--green);
  border: none;
  border-radius: 14px;
  padding: 16px;
  color: #000;
  font-family: 'Clash Display', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s;
  letter-spacing: 0.04em;
  margin-top: 24px;
}

.iv-back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,255,127,0.3);
}
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

  const startTimer = () => {
    setTimer(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const fmt = (t) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const toggleSpeak = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); }
    else speak(question);
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/interview/start`, { role, difficulty }, { headers: getHeaders() });
      setQuestion(res.data.question);
      speak(res.data.question);
      setScreen("interview");
      startTimer();
    } catch (err) { alert("Error: " + err.message); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    if (recRef.current) { recRef.current.stop(); setListening(false); }
    try {
      const res = await axios.post(
        `${API_URL}/api/interview/answer`,
        { role, difficulty, question, answer, questionNumber: qNum, totalQuestions: qCount },
        { headers: getHeaders() }
      );
      const newHistory = [...history, { question, answer, score: res.data.score, feedback: res.data.feedback, correctAnswer: res.data.correctAnswer }];
      setHistory(newHistory);
      setFeedback(res.data);
      speak(`Your score is ${res.data.score} out of 10. ${res.data.feedback}`);
      if (!res.data.nextQuestion) {
        const reportRes = await axios.post(`${API_URL}/api/interview/report`, { role, difficulty, history: newHistory }, { headers: getHeaders() });
        await axios.post(`${API_URL}/api/sessions/save`, { role, difficulty, totalQuestions: qCount, history: newHistory, report: reportRes.data }, { headers: getHeaders() });
        setReport(reportRes.data);
        setScreen("results");
      }
    } catch (err) { alert("Error: " + err.message); }
    setLoading(false);
  };

  const nextQuestion = () => {
    const nextQ = feedback.nextQuestion;
    setQuestion(nextQ);
    setTimeout(() => speak(nextQ), 400);
    setAnswer(""); setFeedback(null);
    setQNum((n) => n + 1);
    startTimer();
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Use Chrome."); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
    let committed = answer;
    rec.onresult = (e) => {
      let interim = "", newC = committed;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) newC += " " + e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      committed = newC.trim();
      setAnswer((committed + " " + interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => { setListening(false); setAnswer(committed.trim()); };
    rec.start(); setListening(true);
  };

  const progress = ((qNum - 1) / qCount) * 100;
  const roleMeta = ROLES.find((r) => r.id === role);

  /* ── SETUP SCREEN ── */
  if (screen === "setup") return (
    <>
      <style>{styles}</style>
      <div className="iv-root">
        <div className="iv-setup">
          <div className="iv-page-header">
            <div className="iv-eyebrow">✦ AI Interview Practice</div>
            <h1 className="iv-page-title">Configure Your Interview</h1>
            <p className="iv-page-sub">Select your role, difficulty level and number of questions to begin.</p>
          </div>

          <div className="iv-section-label">Select Role</div>
          <div className="iv-roles-grid">
            {ROLES.map((r) => (
              <div key={r.id} className={`iv-role-card${role === r.id ? " active" : ""}`} onClick={() => setRole(r.id)}>
                <div className="iv-role-check">✓</div>
                <span className="iv-role-icon">{r.icon}</span>
                <div className="iv-role-label">{r.label}</div>
                <div className="iv-role-desc">{r.desc}</div>
              </div>
            ))}
          </div>

          <div className="iv-options-row">
            <div className="iv-option-group">
              <div className="iv-section-label">Difficulty</div>
              <div className="iv-pills">
                {DIFFICULTIES.map((d) => (
                  <button key={d} className={`iv-pill${difficulty === d ? " active" : ""}`} onClick={() => setDiff(d)}>{d}</button>
                ))}
              </div>
            </div>
            <div className="iv-option-group">
              <div className="iv-section-label">Questions</div>
              <div className="iv-pills">
                {Q_COUNTS.map((q) => (
                  <button key={q} className={`iv-pill${qCount === q ? " active" : ""}`} onClick={() => setQCount(q)}>{q}</button>
                ))}
              </div>
            </div>
          </div>

          <button className="iv-start-btn" onClick={startInterview} disabled={!role || loading}>
            {loading ? "Starting..." : <>Start Interview <span>→</span></>}
          </button>
        </div>
      </div>
    </>
  );

  /* ── INTERVIEW SCREEN ── */
  if (screen === "interview") return (
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
              <button className={`iv-speak-btn${speaking ? " active" : ""}`} onClick={toggleSpeak}>
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
                <button className={`iv-mic-btn${listening ? " listening" : ""}`} onClick={toggleVoice}>
                  {listening ? "🔴 Listening..." : "🎙 Voice Input"}
                </button>
                <button className="iv-submit-btn" onClick={submitAnswer} disabled={!answer.trim() || loading}>
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
                  <div className="iv-score-title">Score: {feedback.score}/10</div>
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
                <button className="iv-next-btn" onClick={nextQuestion}>Next Question →</button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  /* ── RESULTS SCREEN ── */
  if (screen === "results") {
    const avgScore = history.length
      ? (history.reduce((s, h) => s + h.score, 0) / history.length).toFixed(1) : 0;
    return (
      <>
        <style>{styles}</style>
        <div className="iv-root">
          <div className="iv-results">
            <div className="iv-results-icon">🏁</div>
            <h2 className="iv-results-title">Interview Complete!</h2>
            <p className="iv-results-sub">Here's how you performed across all {qCount} questions.</p>

            <div className="iv-results-card">
              <div className="iv-grade-display" style={{ color: GRADE_COLOR[report?.grade] || "#00ff7f" }}>
                {report?.grade || "—"}
              </div>
              <div className="iv-results-score">
                Overall Score: <span>{report?.overallScore ?? avgScore}/10</span>
              </div>
              <div className="iv-results-stats">
                <div className="iv-stat-box"><div className="iv-stat-val">{history.length}</div><div className="iv-stat-lbl">Questions</div></div>
                <div className="iv-stat-box"><div className="iv-stat-val">{avgScore}</div><div className="iv-stat-lbl">Avg Score</div></div>
                <div className="iv-stat-box"><div className="iv-stat-val">{difficulty.slice(0,3)}</div><div className="iv-stat-lbl">Difficulty</div></div>
                <div className="iv-stat-box"><div className="iv-stat-val">{roleMeta?.icon}</div><div className="iv-stat-lbl">{roleMeta?.label}</div></div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="iv-history-list">
                <div className="iv-section-label" style={{ marginBottom: 12 }}>Question Breakdown</div>
                {history.map((h, i) => (
                  <div key={i} className="iv-history-item">
                    <div className="iv-history-q">
                      <strong>Q{i + 1} &nbsp;</strong>
                      {h.question.length > 80 ? h.question.slice(0, 80) + "…" : h.question}
                    </div>
                    <div className="iv-history-score">{h.score}/10</div>
                  </div>
                ))}
              </div>
            )}

            <button className="iv-back-btn" onClick={() => nav("/dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }
}