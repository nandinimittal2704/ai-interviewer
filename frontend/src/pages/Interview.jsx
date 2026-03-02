import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config.js';

const ROLES = [
  { id:'frontend', label:'Frontend Dev', icon:'⚛️', desc:'React, CSS, JS' },
  { id:'backend',  label:'Backend Dev',  icon:'⚙️', desc:'Node.js, APIs, DB' },
  { id:'fullstack',label:'Full Stack',   icon:'🔗', desc:'End-to-end Dev' },
  { id:'dsa',      label:'DSA',          icon:'🧮', desc:'Algorithms & DS' },
  { id:'system',   label:'System Design',icon:'🏗️', desc:'Architecture' },
  { id:'hr',       label:'HR Round',     icon:'🤝', desc:'Behavioral' },
];
const DIFFICULTIES = ['Beginner','Intermediate','Advanced'];
const Q_COUNTS = [5, 10, 15];
const GRADE_COLOR = { A:'#22c55e', B:'#3b82f6', C:'#f59e0b', D:'#f97316', F:'#ef4444' };

const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function Interview() {
  const [screen, setScreen] = useState('setup');
  const [role, setRole] = useState(null);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [qCount, setQCount] = useState(5);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [qNum, setQNum] = useState(1);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [listening, setListening] = useState(false);
  const timerRef = useRef(null);
  const nav = useNavigate();

  const startTimer = () => {
    setTimer(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => t+1), 1000);
  };
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // START INTERVIEW
  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/interview/start`,
        { role, difficulty }, { headers: getHeaders() });
      setQuestion(res.data.question);
      setScreen('interview');
      startTimer();
    } catch (err) {
      alert('Error starting interview: ' + err.message);
    }
    setLoading(false);
  };

  // SUBMIT ANSWER
  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    clearInterval(timerRef.current);
    try {
      const res = await axios.post(`${API_URL}/api/interview/answer`, {
        role, difficulty, question, answer,
        questionNumber: qNum, totalQuestions: qCount
      }, { headers: getHeaders() });

      const newHistory = [...history, {
        question, answer,
        score: res.data.score,
        feedback: res.data.feedback,
        correctAnswer: res.data.correctAnswer,
      }];
      setHistory(newHistory);
      setFeedback(res.data);

      // If last question, generate report
      if (!res.data.nextQuestion) {
        const reportRes = await axios.post(`${API_URL}/api/interview/report`,
          { role, difficulty, history: newHistory },
          { headers: getHeaders() });
        
        // Save session
        await axios.post(`${API_URL}/api/sessions/save`, {
          role, difficulty, totalQuestions: qCount,
          history: newHistory, report: reportRes.data
        }, { headers: getHeaders() });

        setReport(reportRes.data);
        setScreen('results');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  // NEXT QUESTION
  const nextQuestion = () => {
    setQuestion(feedback.nextQuestion);
    setAnswer('');
    setFeedback(null);
    setQNum(n => n+1);
    startTimer();
  };

  // VOICE INPUT
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

  const progress = ((qNum-1) / qCount) * 100;
  const roleMeta = ROLES.find(r => r.id === role);

  // ── SETUP SCREEN ──
  if (screen === 'setup') return (
    <div style={s.wrap}>
      <div style={s.setupCard}>
        <button style={s.back} onClick={() => nav('/dashboard')}>← Dashboard</button>
        <h1 style={s.setupTitle}>🤖 Start Interview</h1>
        <p style={s.setupSub}>Choose your role and difficulty</p>

        <p style={s.label}>Select Role</p>
        <div style={s.roleGrid}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)}
              style={{...s.roleCard, ...(role===r.id ? s.roleActive : {})}}>
              <span style={{fontSize:28}}>{r.icon}</span>
              <span style={s.roleLabel}>{r.label}</span>
              <span style={s.roleDesc}>{r.desc}</span>
            </button>
          ))}
        </div>

        <p style={s.label}>Difficulty</p>
        <div style={s.pillRow}>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              style={{...s.pill, ...(difficulty===d ? s.pillActive : {})}}>
              {d}
            </button>
          ))}
        </div>

        <p style={s.label}>Questions</p>
        <div style={s.pillRow}>
          {Q_COUNTS.map(n => (
            <button key={n} onClick={() => setQCount(n)}
              style={{...s.pill, ...(qCount===n ? s.pillActive : {})}}>
              {n} Questions
            </button>
          ))}
        </div>

        <button onClick={startInterview} disabled={!role || loading}
          style={{...s.startBtn, ...(!role ? s.startDisabled : {})}}>
          {loading ? 'Starting...' : role ? `Start ${roleMeta?.label} Interview →` : 'Select a role first'}
        </button>
      </div>
    </div>
  );

  // ── INTERVIEW SCREEN ──
  if (screen === 'interview') return (
    <div style={s.wrap}>
      <div style={s.iHeader}>
        <div style={s.iHeaderLeft}>
          <span>{roleMeta?.icon}</span>
          <span style={s.iRole}>{roleMeta?.label}</span>
          <span style={s.iDiff}>{difficulty}</span>
        </div>
        <div style={s.iHeaderRight}>
          <span style={s.timerBadge}>⏱ {fmt(timer)}</span>
          <span style={s.qBadge}>Q {qNum}/{qCount}</span>
        </div>
      </div>

      <div style={s.progressBar}>
        <div style={{...s.progressFill, width:`${progress}%`}} />
      </div>

      <div style={s.iBody}>
        <div style={s.questionCard}>
          <p style={s.qLabel}>Question {qNum} of {qCount}</p>
          <p style={s.qText}>{question}</p>
        </div>

        {!feedback && (
          <div style={s.answerSection}>
            <textarea style={s.textarea} rows={6}
              placeholder="Type your answer here... Be detailed and specific."
              value={answer} onChange={e => setAnswer(e.target.value)} />
            <div style={s.answerBtns}>
              <button onClick={toggleVoice}
                style={{...s.voiceBtn, ...(listening ? s.voiceActive : {})}}>
                {listening ? '🔴 Stop' : '🎤 Speak'}
              </button>
              <button onClick={submitAnswer} disabled={loading || !answer.trim()}
                style={{...s.submitBtn, ...(loading||!answer.trim() ? s.submitDisabled : {})}}>
                {loading ? 'Evaluating...' : 'Submit Answer →'}
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div style={s.feedbackCard}>
            <div style={s.scoreRow}>
              <div style={{...s.scoreBadge,
                background: feedback.score>=7?'#22c55e22':feedback.score>=4?'#f59e0b22':'#ef444422',
                border: `2px solid ${feedback.score>=7?'#22c55e':feedback.score>=4?'#f59e0b':'#ef4444'}`}}>
                <span style={{fontSize:28,fontWeight:800,
                  color:feedback.score>=7?'#22c55e':feedback.score>=4?'#f59e0b':'#ef4444'}}>
                  {feedback.score}
                </span>
                <span style={{fontSize:12,color:'#888'}}>/10</span>
              </div>
              <div>
                <p style={s.fbTitle}>AI Feedback</p>
                <p style={s.fbText}>{feedback.feedback}</p>
              </div>
            </div>

            {feedback.followUp && (
              <div style={s.followUp}>
                <p style={s.followUpLabel}>🔄 Follow-up Question</p>
                <p style={s.followUpText}>{feedback.followUp}</p>
              </div>
            )}

            <div style={s.idealBox}>
              <p style={s.idealLabel}>✅ Ideal Answer</p>
              <p style={s.idealText}>{feedback.correctAnswer}</p>
            </div>

            {feedback.nextQuestion && (
              <button onClick={nextQuestion} style={s.nextBtn}>
                Next Question ({qNum+1}/{qCount}) →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── RESULTS SCREEN ──
  if (screen === 'results') return (
    <div style={s.wrap}>
      <div style={s.resultsCard}>
        <div style={s.resultsTop}>
          <div style={s.gradeCircle}>
            <span style={{fontSize:44,fontWeight:900,color:GRADE_COLOR[report?.grade]||'#fff'}}>
              {report?.grade}
            </span>
          </div>
          <div>
            <h2 style={s.resultsTitle}>Interview Complete!</h2>
            <p style={s.resultsMeta}>{roleMeta?.icon} {roleMeta?.label} · {difficulty}</p>
            <p style={s.resultsScore}>
              <span style={{fontSize:40,fontWeight:800,color:'#6366f1'}}>{report?.overallScore}</span>
              <span style={{color:'#555'}}>/10 avg</span>
            </p>
          </div>
        </div>

        <div style={s.recBox}>
          <p style={s.recLabel}>📋 Assessment</p>
          <p style={s.recText}>{report?.recommendation}</p>
        </div>

        <div style={s.twoCol}>
          <div style={s.listBox}>
            <p style={{...s.listTitle,color:'#22c55e'}}>💪 Strengths</p>
            {report?.strengths?.map((item,i) => (
              <p key={i} style={s.listItem}>✓ {item}</p>
            ))}
          </div>
          <div style={s.listBox}>
            <p style={{...s.listTitle,color:'#f59e0b'}}>📈 Improve</p>
            {report?.improvements?.map((item,i) => (
              <p key={i} style={s.listItem}>→ {item}</p>
            ))}
          </div>
        </div>

        <div style={s.studyBox}>
          <p style={s.studyLabel}>📚 Study Topics</p>
          <div style={s.topicRow}>
            {report?.studyTopics?.map((t,i) => (
              <span key={i} style={s.topic}>{t}</span>
            ))}
          </div>
        </div>

        <div style={s.breakdown}>
          <p style={s.breakdownTitle}>📝 Question Breakdown</p>
          {history.map((h,i) => (
            <div key={i} style={s.bItem}>
              <div style={s.bHeader}>
                <span style={s.bQ}>Q{i+1}</span>
                <span style={{fontWeight:700,color:h.score>=7?'#22c55e':h.score>=4?'#f59e0b':'#ef4444'}}>
                  {h.score}/10
                </span>
              </div>
              <p style={s.bQuestion}>{h.question}</p>
              <p style={s.bFeedback}>{h.feedback}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:12,marginTop:8}}>
          <button onClick={() => { setScreen('setup');setHistory([]);setFeedback(null);setQNum(1);setAnswer(''); }}
            style={s.restartBtn}>🔄 New Interview</button>
          <button onClick={() => nav('/dashboard')} style={s.dashBtn}>
            📊 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: {
  minHeight: '100vh',
  background: '#0a0a0f',
  paddingBottom: '60px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
},
  // Setup
  setupCard: { maxWidth:700, margin:'0 auto', padding:'40px 24px' },
  back: { background:'transparent', border:'none', color:'#555', fontSize:14, cursor:'pointer', marginBottom:24, padding:0 },
  setupTitle: { fontSize:28, fontWeight:800, color:'#fff', marginBottom:8 },
  setupSub: { fontSize:15, color:'#555', marginBottom:32 },
  label: { fontSize:12, fontWeight:600, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:14, marginTop:8 },
  roleGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 },
  roleCard: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:12, padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4, cursor:'pointer', transition:'all 0.2s', textAlign:'left' },
  roleActive: { background:'#1e1b4b', border:'1px solid #6366f1' },
  roleLabel: { fontSize:14, fontWeight:600, color:'#e2e8f0' },
  roleDesc: { fontSize:11, color:'#555' },
  pillRow: { display:'flex', gap:10, marginBottom:28, flexWrap:'wrap' },
  pill: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:50, padding:'8px 20px', fontSize:14, color:'#888', cursor:'pointer' },
  pillActive: { background:'#1e1b4b', border:'1px solid #6366f1', color:'#a5b4fc' },
  startBtn: { width:'100%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:12, padding:16, fontSize:16, fontWeight:600, color:'#fff', cursor:'pointer', marginTop:8 },
  startDisabled: { background:'#1e1e2e', color:'#444', cursor:'not-allowed' },

  // Interview header
  iHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', background:'#111118', borderBottom:'1px solid #1e1e2e' },
  iHeaderLeft: { display:'flex', alignItems:'center', gap:10 },
  iRole: { fontWeight:700, fontSize:16, color:'#fff' },
  iDiff: { background:'#1e1b4b', color:'#a5b4fc', fontSize:12, padding:'3px 10px', borderRadius:50 },
  iHeaderRight: { display:'flex', gap:10 },
  timerBadge: { background:'#0d0d15', border:'1px solid #1e1e2e', color:'#a5b4fc', fontSize:13, padding:'5px 12px', borderRadius:50, fontFamily:'monospace' },
  qBadge: { background:'#0d0d15', border:'1px solid #1e1e2e', color:'#888', fontSize:13, padding:'5px 12px', borderRadius:50 },
  progressBar: { height:3, background:'#1e1e2e' },
  progressFill: { height:'100%', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', transition:'width 0.5s' },
  iBody: { maxWidth:760, margin:'0 auto', padding:'36px 24px', display:'flex', flexDirection:'column', gap:20 },

  // Question
  questionCard: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:16, padding:'28px 32px' },
  qLabel: { fontSize:11, fontWeight:600, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:14 },
  qText: { fontSize:18, lineHeight:1.7, color:'#e2e8f0', fontWeight:600 },

  // Answer
  answerSection: { display:'flex', flexDirection:'column', gap:14 },
  textarea: { width:'100%', background:'#111118', border:'1px solid #1e1e2e', borderRadius:12, padding:'18px', fontSize:15, color:'#e2e8f0', lineHeight:1.6, resize:'vertical', fontFamily:'sans-serif', outline:'none' },
  answerBtns: { display:'flex', gap:12, justifyContent:'flex-end' },
  voiceBtn: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:10, padding:'11px 20px', color:'#888', fontSize:14, cursor:'pointer' },
  voiceActive: { background:'#3f0f0f', border:'1px solid #ef4444', color:'#ef4444' },
  submitBtn: { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, padding:'11px 24px', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer' },
  submitDisabled: { background:'#1e1e2e', color:'#444', cursor:'not-allowed' },

  // Feedback
  feedbackCard: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:16, padding:28, display:'flex', flexDirection:'column', gap:18 },
  scoreRow: { display:'flex', gap:18, alignItems:'flex-start' },
  scoreBadge: { minWidth:68, height:68, borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 },
  fbTitle: { fontSize:11, fontWeight:600, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:8 },
  fbText: { fontSize:14, lineHeight:1.7, color:'#94a3b8' },
  followUp: { background:'#1e1b4b33', border:'1px solid #6366f144', borderRadius:10, padding:'14px 18px' },
  followUpLabel: { fontSize:12, fontWeight:600, color:'#a5b4fc', marginBottom:8 },
  followUpText: { fontSize:14, color:'#c7d2fe', lineHeight:1.6 },
  idealBox: { background:'#0d150d', border:'1px solid #166534', borderRadius:10, padding:'14px 18px' },
  idealLabel: { fontSize:12, fontWeight:600, color:'#22c55e', marginBottom:8 },
  idealText: { fontSize:14, color:'#86efac', lineHeight:1.6 },
  nextBtn: { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, padding:'13px 24px', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', alignSelf:'flex-end' },

  // Results
  resultsCard: { maxWidth:760, margin:'0 auto', padding:'40px 24px', display:'flex', flexDirection:'column', gap:20 },
  resultsTop: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:20, padding:32, display:'flex', gap:24, alignItems:'center' },
  gradeCircle: { width:90, height:90, background:'#0d0d15', border:'2px solid #1e1e2e', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  resultsTitle: { fontSize:26, fontWeight:800, color:'#fff', marginBottom:4 },
  resultsMeta: { fontSize:14, color:'#555', marginBottom:8 },
  resultsScore: { display:'flex', alignItems:'baseline', gap:8 },
  recBox: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:16, padding:'22px 26px' },
  recLabel: { fontSize:11, fontWeight:600, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:10 },
  recText: { fontSize:14, lineHeight:1.7, color:'#94a3b8' },
  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  listBox: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:16, padding:22 },
  listTitle: { fontSize:13, fontWeight:700, marginBottom:14 },
  listItem: { fontSize:13, color:'#94a3b8', lineHeight:1.6, marginBottom:8 },
  studyBox: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:16, padding:'22px 26px' },
  studyLabel: { fontSize:11, fontWeight:600, color:'#6366f1', letterSpacing:2, textTransform:'uppercase', marginBottom:14 },
  topicRow: { display:'flex', flexWrap:'wrap', gap:10 },
  topic: { background:'#1e1b4b', border:'1px solid #3730a3', color:'#a5b4fc', fontSize:13, padding:'5px 14px', borderRadius:50 },
  breakdown: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:16, padding:26, display:'flex', flexDirection:'column', gap:18 },
  breakdownTitle: { fontSize:11, fontWeight:600, color:'#6366f1', letterSpacing:2, textTransform:'uppercase' },
  bItem: { borderBottom:'1px solid #1e1e2e', paddingBottom:16, display:'flex', flexDirection:'column', gap:6 },
  bHeader: { display:'flex', justifyContent:'space-between' },
  bQ: { fontSize:11, fontWeight:700, color:'#6366f1', background:'#1e1b4b', padding:'2px 10px', borderRadius:50 },
  bQuestion: { fontSize:14, fontWeight:600, color:'#e2e8f0', lineHeight:1.5 },
  bFeedback: { fontSize:13, color:'#555', lineHeight:1.6 },
  restartBtn: { flex:1, background:'#111118', border:'1px solid #6366f1', borderRadius:12, padding:14, fontSize:15, fontWeight:600, color:'#6366f1', cursor:'pointer' },
  dashBtn: { flex:1, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:12, padding:14, fontSize:15, fontWeight:600, color:'#fff', cursor:'pointer' },
};

