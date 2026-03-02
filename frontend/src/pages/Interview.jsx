import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config.js';

const ROLES = [
  { id:'frontend',  label:'Frontend Dev',   icon:'⚛️', desc:'React, CSS, JS' },
  { id:'backend',   label:'Backend Dev',    icon:'⚙️', desc:'Node.js, APIs, DB' },
  { id:'fullstack', label:'Full Stack',     icon:'🔗', desc:'End-to-end Dev' },
  { id:'dsa',       label:'DSA',            icon:'🧮', desc:'Algorithms & DS' },
  { id:'system',    label:'System Design',  icon:'🏗️', desc:'Architecture' },
  { id:'hr',        label:'HR Round',       icon:'🤝', desc:'Behavioral' },
];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const Q_COUNTS = [5, 10, 15];
const GRADE_COLOR = { A:'#22c55e', B:'#6366f1', C:'#f59e0b', D:'#f97316', F:'#ef4444' };

const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function Interview() {
  const [screen, setScreen]       = useState('setup');
  const [role, setRole]           = useState(null);
  const [difficulty, setDiff]     = useState('Intermediate');
  const [qCount, setQCount]       = useState(5);
  const [question, setQuestion]   = useState('');
  const [answer, setAnswer]       = useState('');
  const [qNum, setQNum]           = useState(1);
  const [history, setHistory]     = useState([]);
  const [feedback, setFeedback]   = useState(null);
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [timer, setTimer]         = useState(0);
  const [listening, setListening] = useState(false);
  const timerRef = useRef(null);
  const nav = useNavigate();

  const startTimer = () => {
    setTimer(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };
  const fmt = t => `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/interview/start`, { role, difficulty }, { headers: getHeaders() });
      setQuestion(res.data.question);
      setScreen('interview');
      startTimer();
    } catch (err) { alert('Error: ' + err.message); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    clearInterval(timerRef.current);
    try {
      const res = await axios.post(`${API_URL}/api/interview/answer`, {
        role, difficulty, question, answer, questionNumber: qNum, totalQuestions: qCount
      }, { headers: getHeaders() });
      const newHistory = [...history, { question, answer, score: res.data.score, feedback: res.data.feedback, correctAnswer: res.data.correctAnswer }];
      setHistory(newHistory);
      setFeedback(res.data);
      if (!res.data.nextQuestion) {
        const reportRes = await axios.post(`${API_URL}/api/interview/report`, { role, difficulty, history: newHistory }, { headers: getHeaders() });
        await axios.post(`${API_URL}/api/sessions/save`, { role, difficulty, totalQuestions: qCount, history: newHistory, report: reportRes.data }, { headers: getHeaders() });
        setReport(reportRes.data);
        setScreen('results');
      }
    } catch (err) { alert('Error: ' + err.message); }
    setLoading(false);
  };

  const nextQuestion = () => {
    setQuestion(feedback.nextQuestion);
    setAnswer(''); setFeedback(null);
    setQNum(n => n + 1);
    startTimer();
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Speech recognition not supported');
    if (listening) { setListening(false); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.onresult = e => setAnswer(a => a + ' ' + e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const progress = ((qNum - 1) / qCount) * 100;
  const roleMeta = ROLES.find(r => r.id === role);

  // ─────────────────────────────────────────────
  // SETUP SCREEN
  // ─────────────────────────────────────────────
  if (screen === 'setup') return (
    <div style={s.wrap}>
      <style>{css}</style>

      {/* Background */}
      <div style={s.bg}>
        <div style={s.bgOrb1}/><div style={s.bgOrb2}/><div style={s.bgOrb3}/>
        <div style={s.bgGrid}/>
        <div style={s.bgStreak1}/><div style={s.bgStreak2}/>
      </div>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerIcon}>🤖</span>
          <span style={s.headerTitle}>Start Interview</span>
        </div>
        <button style={s.backBtn} onClick={() => nav('/dashboard')}>← Dashboard</button>
      </header>

      {/* Content */}
      <div style={s.setupBody}>
        <div style={s.setupCenter}>
          <h1 style={s.pageTitle}>Start Interview</h1>
          <p style={s.pageSub}>Choose your role and difficulty.</p>

          {/* Role Grid */}
          <div style={s.roleGrid}>
            {ROLES.map(r => (
              <button key={r.id} className="role-card" onClick={() => setRole(r.id)}
                style={{ ...s.roleCard, ...(role === r.id ? s.roleCardActive : {}) }}>
                {role === r.id && <div style={s.roleCardGlow}/>}
                <div style={{ ...s.roleIconBox, ...(role === r.id ? s.roleIconBoxActive : {}) }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                </div>
                <div style={s.roleText}>
                  <span style={s.roleLabel}>{r.label}</span>
                  <span style={s.roleDesc}>{r.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <p style={s.sectionLabel}>DIFFICULTY</p>
          <div style={s.pillRow}>
            {DIFFICULTIES.map(d => (
              <button key={d} className="pill-btn" onClick={() => setDiff(d)}
                style={{ ...s.pill, ...(difficulty === d ? s.pillActive : {}) }}>
                {d}
              </button>
            ))}
          </div>

          {/* Questions */}
          <p style={s.sectionLabel}>QUESTIONS</p>
          <div style={s.pillRow}>
            {Q_COUNTS.map(n => (
              <button key={n} className="pill-btn" onClick={() => setQCount(n)}
                style={{ ...s.pill, ...(qCount === n ? s.pillActive : {}) }}>
                {n} Questions
              </button>
            ))}
          </div>

          {/* Status */}
          {!role && <p style={s.selectHint}>Select options to begin.</p>}

          {/* Start button */}
          <button className="start-btn" onClick={startInterview}
            disabled={!role || loading}
            style={{ ...s.startBtn, ...(!role ? s.startBtnDisabled : {}) }}>
            {loading ? 'Starting...' : 'Start Interview'}
          </button>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // INTERVIEW SCREEN
  // ─────────────────────────────────────────────
  if (screen === 'interview') return (
    <div style={s.wrap}>
      <style>{css}</style>
      <div style={s.bg}>
        <div style={s.bgOrb1}/><div style={s.bgOrb2}/><div style={s.bgOrb3}/>
        <div style={s.bgGrid}/><div style={s.bgStreak1}/><div style={s.bgStreak2}/>
      </div>

      {/* Header */}
      <header style={s.iHeader}>
        <div style={s.iHeaderLeft}>
          <span style={s.headerIcon}>🤖</span>
          <span style={s.iRoleText}>{roleMeta?.label}</span>
          <span style={s.iDiffBadge}>{difficulty}</span>
        </div>
        <div style={s.iHeaderRight}>
          <span style={s.timerBadge}>⏱ {fmt(timer)}</span>
          <span style={s.qBadge}>Q {qNum}/{qCount}</span>
        </div>
      </header>

      {/* Progress */}
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${progress}%` }}/>
      </div>

      <div style={s.iBody}>
        {/* Question */}
        <div style={s.questionCard}>
          <p style={s.qNumLabel}>Question {qNum} of {qCount}</p>
          <p style={s.qText}>{question}</p>
        </div>

        {/* Answer */}
        {!feedback && (
          <div style={s.answerSection}>
            <textarea style={s.textarea} rows={6}
              placeholder="Type your answer here... Be detailed and specific."
              value={answer} onChange={e => setAnswer(e.target.value)}/>
            <div style={s.answerBtns}>
              <button className="voice-btn" onClick={toggleVoice}
                style={{ ...s.voiceBtn, ...(listening ? s.voiceBtnActive : {}) }}>
                {listening ? '🔴 Stop' : '🎤 Speak'}
              </button>
              <button className="submit-btn" onClick={submitAnswer}
                disabled={loading || !answer.trim()}
                style={{ ...s.submitBtn, ...(loading || !answer.trim() ? s.submitBtnDisabled : {}) }}>
                {loading ? 'Evaluating...' : 'Submit Answer →'}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={s.feedbackCard}>
            <div style={s.scoreRow}>
              <div style={{
                ...s.scoreBadge,
                background: feedback.score>=7?'#22c55e18':feedback.score>=4?'#f59e0b18':'#ef444418',
                border: `2px solid ${feedback.score>=7?'#22c55e':feedback.score>=4?'#f59e0b':'#ef4444'}`
              }}>
                <span style={{ fontSize:30, fontWeight:900, color: feedback.score>=7?'#22c55e':feedback.score>=4?'#f59e0b':'#ef4444' }}>
                  {feedback.score}
                </span>
                <span style={{ fontSize:12, color:'#64748b' }}>/10</span>
              </div>
              <div style={{ flex:1 }}>
                <p style={s.fbLabel}>AI Feedback</p>
                <p style={s.fbText}>{feedback.feedback}</p>
              </div>
            </div>
            {feedback.followUp && (
              <div style={s.followUpBox}>
                <p style={s.followUpLabel}>🔄 Follow-up</p>
                <p style={s.followUpText}>{feedback.followUp}</p>
              </div>
            )}
            <div style={s.idealBox}>
              <p style={s.idealLabel}>✅ Ideal Answer</p>
              <p style={s.idealText}>{feedback.correctAnswer}</p>
            </div>
            {feedback.nextQuestion && (
              <button className="submit-btn" onClick={nextQuestion} style={s.nextBtn}>
                Next Question ({qNum+1}/{qCount}) →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────
  if (screen === 'results') return (
    <div style={s.wrap}>
      <style>{css}</style>
      <div style={s.bg}>
        <div style={s.bgOrb1}/><div style={s.bgOrb2}/><div style={s.bgOrb3}/>
        <div style={s.bgGrid}/><div style={s.bgStreak1}/><div style={s.bgStreak2}/>
      </div>

      <div style={s.resultsWrap}>
        {/* Top card */}
        <div style={s.resultsTopCard}>
          <div style={s.gradeCircle}>
            <span style={{ fontSize:48, fontWeight:900, color: GRADE_COLOR[report?.grade]||'#fff' }}>
              {report?.grade}
            </span>
          </div>
          <div>
            <h2 style={s.resultsTitle}>Interview Complete!</h2>
            <p style={s.resultsMeta}>{roleMeta?.icon} {roleMeta?.label} · {difficulty}</p>
            <p style={s.resultsScore}>
              <span style={{ fontSize:42, fontWeight:900, color:'#a5b4fc' }}>{report?.overallScore}</span>
              <span style={{ color:'#475569', fontSize:16 }}> / 10 avg</span>
            </p>
          </div>
        </div>

        {/* Assessment */}
        <div style={s.recCard}>
          <p style={s.recLabel}>📋 Assessment</p>
          <p style={s.recText}>{report?.recommendation}</p>
        </div>

        {/* Two col */}
        <div style={s.twoCol}>
          <div style={s.listCard}>
            <p style={{ ...s.listTitle, color:'#22c55e' }}>💪 Strengths</p>
            {report?.strengths?.map((item,i) => <p key={i} style={s.listItem}>✓ {item}</p>)}
          </div>
          <div style={s.listCard}>
            <p style={{ ...s.listTitle, color:'#f59e0b' }}>📈 Improve</p>
            {report?.improvements?.map((item,i) => <p key={i} style={s.listItem}>→ {item}</p>)}
          </div>
        </div>

        {/* Study topics */}
        <div style={s.studyCard}>
          <p style={s.recLabel}>📚 Study Topics</p>
          <div style={s.topicRow}>
            {report?.studyTopics?.map((t,i) => <span key={i} style={s.topic}>{t}</span>)}
          </div>
        </div>

        {/* Breakdown */}
        <div style={s.breakdownCard}>
          <p style={s.recLabel}>📝 Question Breakdown</p>
          {history.map((h,i) => (
            <div key={i} style={s.bItem}>
              <div style={s.bHeader}>
                <span style={s.bQ}>Q{i+1}</span>
                <span style={{ fontWeight:700, color: h.score>=7?'#22c55e':h.score>=4?'#f59e0b':'#ef4444' }}>{h.score}/10</span>
              </div>
              <p style={s.bQuestion}>{h.question}</p>
              <p style={s.bFeedback}>{h.feedback}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:12 }}>
          <button className="outline-btn" style={s.outlineBtn}
            onClick={() => { setScreen('setup');setHistory([]);setFeedback(null);setQNum(1);setAnswer('');setReport(null); }}>
            🔄 New Interview
          </button>
          <button className="submit-btn" style={s.dashBtn} onClick={() => nav('/dashboard')}>
            📊 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #07060f; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer  { 0%,100%{opacity:.5;} 50%{opacity:1;} }
  @keyframes streakIn { from{opacity:0;transform:translateX(-60px);} to{opacity:1;transform:translateX(0);} }
  @keyframes spin     { to{transform:rotate(360deg);} }

  .role-card:hover { transform:translateY(-2px); transition:all 0.25s; }
  .pill-btn:hover  { border-color:#6366f1 !important; color:#a5b4fc !important; transition:all 0.2s; }
  .start-btn:hover { box-shadow:0 0 40px #6366f166; transform:translateY(-1px); transition:all 0.25s; }
  .submit-btn:hover { box-shadow:0 0 30px #6366f155; transform:translateY(-1px); transition:all 0.2s; }
  .voice-btn:hover  { border-color:#6366f1 !important; transition:all 0.2s; }
  .outline-btn:hover { background:#6366f111 !important; transition:all 0.2s; }
  textarea:focus { outline:none; border-color:#6366f188 !important; box-shadow:0 0 0 3px #6366f115; }
`;

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s = {
  wrap: { minHeight:'100vh', background:'#07060f', fontFamily:"'Outfit',sans-serif", position:'relative', overflowX:'hidden' },

  // Background
  bg:        { position:'fixed', inset:0, zIndex:0, pointerEvents:'none' },
  bgOrb1:    { position:'absolute', width:700, height:700, borderRadius:'50%', top:'-25%', left:'-15%', background:'radial-gradient(circle,#4f46e540 0%,transparent 65%)', filter:'blur(50px)' },
  bgOrb2:    { position:'absolute', width:600, height:600, borderRadius:'50%', top:'5%', right:'-15%', background:'radial-gradient(circle,#7c3aed35 0%,transparent 65%)', filter:'blur(60px)', animation:'shimmer 7s ease infinite' },
  bgOrb3:    { position:'absolute', width:500, height:500, borderRadius:'50%', bottom:'-15%', left:'25%', background:'radial-gradient(circle,#312e8128 0%,transparent 65%)', filter:'blur(50px)' },
  bgGrid:    { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize:'44px 44px' },
  bgStreak1: { position:'absolute', top:'18%', left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#8b5cf640,#6366f160,transparent)', filter:'blur(2px)', animation:'streakIn 1.5s ease' },
  bgStreak2: { position:'absolute', top:'22%', left:'10%', right:'10%', height:1, background:'linear-gradient(90deg,transparent,#a78bfa30,transparent)', filter:'blur(1px)' },

  // Header (setup)
  header:      { position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 36px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(16px)' },
  headerLeft:  { display:'flex', alignItems:'center', gap:10 },
  headerIcon:  { fontSize:22 },
  headerTitle: { fontSize:17, fontWeight:700, color:'#e2e8f0', letterSpacing:'-0.3px' },
  backBtn:     { background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 16px', color:'#64748b', fontSize:13, cursor:'pointer' },

  // Setup body
  setupBody:   { position:'relative', zIndex:1, display:'flex', justifyContent:'center', padding:'52px 24px 80px' },
  setupCenter: { width:'100%', maxWidth:680, display:'flex', flexDirection:'column', gap:0, animation:'fadeUp 0.5s ease' },
  pageTitle:   { fontSize:36, fontWeight:800, color:'#fff', textAlign:'center', letterSpacing:'-1px', marginBottom:10 },
  pageSub:     { fontSize:16, color:'#64748b', textAlign:'center', marginBottom:36 },

  // Role grid
  roleGrid:        { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:32 },
  roleCard:        { position:'relative', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'16px 14px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', textAlign:'left', overflow:'hidden', transition:'all 0.25s' },
  roleCardActive:  { background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.55)', boxShadow:'0 0 24px rgba(99,102,241,0.2), inset 0 0 24px rgba(99,102,241,0.05)' },
  roleCardGlow:    { position:'absolute', inset:0, background:'radial-gradient(circle at 50% 0%,rgba(99,102,241,0.15),transparent 70%)', pointerEvents:'none' },
  roleIconBox:     { width:38, height:38, borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  roleIconBoxActive:{ background:'rgba(99,102,241,0.25)', border:'1px solid rgba(99,102,241,0.5)' },
  roleText:        { display:'flex', flexDirection:'column', gap:2 },
  roleLabel:       { fontSize:13, fontWeight:700, color:'#e2e8f0' },
  roleDesc:        { fontSize:11, color:'#64748b' },

  // Pills
  sectionLabel: { fontSize:11, fontWeight:700, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:12, marginTop:4 },
  pillRow:      { display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' },
  pill:         { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'8px 22px', fontSize:14, color:'#94a3b8', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:500, transition:'all 0.2s' },
  pillActive:   { background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.6)', color:'#c7d2fe', fontWeight:600, boxShadow:'0 0 16px rgba(99,102,241,0.2)' },

  selectHint: { fontSize:14, color:'#475569', marginBottom:16, marginTop:4 },

  // Start button
  startBtn:         { width:'100%', background:'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)', border:'1px solid rgba(139,92,246,0.4)', borderRadius:14, padding:'16px', fontSize:17, fontWeight:700, color:'#fff', cursor:'pointer', letterSpacing:'-0.2px', boxShadow:'0 4px 24px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)', fontFamily:"'Outfit',sans-serif", marginTop:8 },
  startBtnDisabled: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#475569', cursor:'not-allowed', boxShadow:'none' },

  // Interview header
  iHeader:      { position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(16px)' },
  iHeaderLeft:  { display:'flex', alignItems:'center', gap:10 },
  iRoleText:    { fontSize:16, fontWeight:700, color:'#e2e8f0' },
  iDiffBadge:   { background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.35)', borderRadius:50, padding:'3px 12px', fontSize:12, color:'#a5b4fc', fontWeight:500 },
  iHeaderRight: { display:'flex', gap:10 },
  timerBadge:   { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'5px 14px', fontSize:13, color:'#a5b4fc', fontFamily:'monospace' },
  qBadge:       { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'5px 14px', fontSize:13, color:'#64748b' },

  progressTrack: { height:3, background:'rgba(255,255,255,0.06)' },
  progressFill:  { height:'100%', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', transition:'width 0.6s ease' },

  iBody: { position:'relative', zIndex:1, maxWidth:760, margin:'0 auto', padding:'36px 24px', display:'flex', flexDirection:'column', gap:20 },

  // Question card
  questionCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'28px 32px', animation:'fadeUp 0.4s ease' },
  qNumLabel:    { fontSize:11, fontWeight:700, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:14 },
  qText:        { fontSize:19, lineHeight:1.7, color:'#e2e8f0', fontWeight:600 },

  // Answer
  answerSection: { display:'flex', flexDirection:'column', gap:14, animation:'fadeUp 0.4s ease 0.1s both' },
  textarea:      { width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'18px 20px', fontSize:15, color:'#e2e8f0', lineHeight:1.7, resize:'vertical', fontFamily:"'Outfit',sans-serif", transition:'all 0.2s' },
  answerBtns:    { display:'flex', gap:12, justifyContent:'flex-end' },
  voiceBtn:      { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'11px 20px', color:'#94a3b8', fontSize:14, cursor:'pointer', fontFamily:"'Outfit',sans-serif" },
  voiceBtnActive:{ background:'rgba(239,68,68,0.1)', border:'1px solid #ef4444', color:'#ef4444' },
  submitBtn:     { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'1px solid rgba(139,92,246,0.4)', borderRadius:10, padding:'11px 26px', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:"'Outfit',sans-serif", boxShadow:'0 4px 20px rgba(99,102,241,0.25)' },
  submitBtnDisabled:{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#475569', cursor:'not-allowed', boxShadow:'none' },

  // Feedback
  feedbackCard:  { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:28, display:'flex', flexDirection:'column', gap:18, animation:'fadeUp 0.4s ease' },
  scoreRow:      { display:'flex', gap:18, alignItems:'flex-start' },
  scoreBadge:    { minWidth:72, height:72, borderRadius:14, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 },
  fbLabel:       { fontSize:11, fontWeight:700, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:8 },
  fbText:        { fontSize:14, lineHeight:1.7, color:'#94a3b8' },
  followUpBox:   { background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, padding:'14px 18px' },
  followUpLabel: { fontSize:12, fontWeight:600, color:'#a5b4fc', marginBottom:8 },
  followUpText:  { fontSize:14, color:'#c7d2fe', lineHeight:1.6 },
  idealBox:      { background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:12, padding:'14px 18px' },
  idealLabel:    { fontSize:12, fontWeight:600, color:'#22c55e', marginBottom:8 },
  idealText:     { fontSize:14, color:'#86efac', lineHeight:1.6 },
  nextBtn:       { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'1px solid rgba(139,92,246,0.4)', borderRadius:10, padding:'13px 26px', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', alignSelf:'flex-end', fontFamily:"'Outfit',sans-serif", boxShadow:'0 4px 20px rgba(99,102,241,0.25)' },

  // Results
  resultsWrap:    { position:'relative', zIndex:1, maxWidth:760, margin:'0 auto', padding:'44px 24px 80px', display:'flex', flexDirection:'column', gap:20, animation:'fadeUp 0.5s ease' },
  resultsTopCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'32px 36px', display:'flex', gap:28, alignItems:'center' },
  gradeCircle:    { width:96, height:96, background:'rgba(99,102,241,0.1)', border:'2px solid rgba(99,102,241,0.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  resultsTitle:   { fontSize:26, fontWeight:800, color:'#fff', marginBottom:4, letterSpacing:'-0.5px' },
  resultsMeta:    { fontSize:14, color:'#64748b', marginBottom:8 },
  resultsScore:   { display:'flex', alignItems:'baseline', gap:4 },
  recCard:        { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'22px 26px' },
  recLabel:       { fontSize:11, fontWeight:700, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:12 },
  recText:        { fontSize:14, lineHeight:1.7, color:'#94a3b8' },
  twoCol:         { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  listCard:       { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:22 },
  listTitle:      { fontSize:13, fontWeight:700, marginBottom:14 },
  listItem:       { fontSize:13, color:'#94a3b8', lineHeight:1.6, marginBottom:8 },
  studyCard:      { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'22px 26px' },
  topicRow:       { display:'flex', flexWrap:'wrap', gap:10 },
  topic:          { background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', color:'#a5b4fc', fontSize:13, padding:'5px 16px', borderRadius:50 },
  breakdownCard:  { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:26, display:'flex', flexDirection:'column', gap:18 },
  bItem:          { borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:16, display:'flex', flexDirection:'column', gap:6 },
  bHeader:        { display:'flex', justifyContent:'space-between' },
  bQ:             { fontSize:11, fontWeight:700, color:'#6366f1', background:'rgba(99,102,241,0.15)', padding:'2px 10px', borderRadius:50 },
  bQuestion:      { fontSize:14, fontWeight:600, color:'#e2e8f0', lineHeight:1.5 },
  bFeedback:      { fontSize:13, color:'#64748b', lineHeight:1.6 },
  outlineBtn:     { flex:1, background:'transparent', border:'1px solid rgba(99,102,241,0.4)', borderRadius:12, padding:14, fontSize:15, fontWeight:600, color:'#6366f1', cursor:'pointer', fontFamily:"'Outfit',sans-serif" },
  dashBtn:        { flex:1, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'1px solid rgba(139,92,246,0.4)', borderRadius:12, padding:14, fontSize:15, fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:"'Outfit',sans-serif", boxShadow:'0 4px 20px rgba(99,102,241,0.25)' },
};