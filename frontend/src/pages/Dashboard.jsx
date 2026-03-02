import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config.js';

const ICONS = { frontend:'⚛️', backend:'⚙️', fullstack:'🔗', dsa:'🧮', system:'🏗️', hr:'🤝' };
const GRADE_COLOR = { A:'#22c55e', B:'#3b82f6', C:'#f59e0b', D:'#f97316', F:'#ef4444' };

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState({});
  const nav = useNavigate();

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    axios.get(`${API_URL}/api/sessions/my`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => setSessions(r.data)).catch(console.error);
  }, []);

  const logout = () => { localStorage.clear(); nav('/login'); };
  const avg = sessions.length ? (sessions.reduce((s,x) => s + x.overallScore, 0) / sessions.length).toFixed(1) : '—';

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.logo}>🤖 AI Interviewer</h1>
        <div style={s.headerRight}>
          <span style={s.user}> {user.name}</span>
          <button style={s.newBtn} onClick={() => nav('/interview')}>+ New Interview</button>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.body}>

        {/* Welcome Section */}
        <div style={s.hero}>
          <h2 style={s.heroTitle}>Welcome back, {user.name} 👋</h2>
          <p style={s.heroSub}>Let’s sharpen your interview skills today.</p>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            ['Interviews', sessions.length],
            ['Avg Score', avg],
            ['Strong Performances', sessions.filter(s=>['A','B'].includes(s.grade)).length]
          ].map(([label, val]) => (
            <div key={label} style={s.statCard}>
              <div style={s.statNumber}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <h2 style={s.sectionTitle}>Recent Interviews</h2>

        {/* Empty State */}
        {sessions.length === 0 ? (
          <div style={s.emptyCard}>
            <div style={{fontSize:48}}>🎯</div>
            <h3 style={{marginTop:12}}>No interviews yet</h3>
            <p style={{color:'#94a3b8', marginTop:6}}>
              Start your first AI-powered mock interview and track your performance.
            </p>
            <button style={{...s.newBtn, marginTop:20}} onClick={() => nav('/interview')}>
              Start New Interview
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {sessions.map(sess => (
              <div key={sess._id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={{fontSize:28}}>{ICONS[sess.role] || '💼'}</span>
                  <span style={{...s.grade, color: GRADE_COLOR[sess.grade]}}>
                    {sess.grade}
                  </span>
                </div>
                <p style={s.cardRole}>{sess.role}</p>
                <p style={s.cardMeta}>{sess.difficulty} · {sess.totalQuestions}Q</p>
                <p style={s.cardScore}>{sess.overallScore}/10</p>
                <p style={s.cardDate}>
                  {new Date(sess.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    minHeight:'100vh',
    background:'radial-gradient(circle at top left, #1e1b4b, #0f172a 60%)',
    color:'#fff'
  },

  header: {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    padding:'20px 40px',
    borderBottom:'1px solid rgba(255,255,255,0.1)',
    backdropFilter:'blur(10px)'
  },

  logo: { fontSize:22, fontWeight:800 },

  headerRight: { display:'flex', alignItems:'center', gap:15 },

  user: { fontSize:14, color:'#cbd5e1' },

  newBtn: {
    background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border:'none',
    borderRadius:12,
    padding:'10px 22px',
    color:'#fff',
    fontWeight:600,
    cursor:'pointer'
  },

  logoutBtn: {
    background:'transparent',
    border:'1px solid rgba(255,255,255,0.2)',
    borderRadius:12,
    padding:'10px 20px',
    color:'#fff',
    cursor:'pointer'
  },

  body: { maxWidth:1100, margin:'0 auto', padding:'50px 24px' },

  hero: { textAlign:'center', marginBottom:50 },

  heroTitle: { fontSize:34, fontWeight:800 },

  heroSub: { color:'#94a3b8', marginTop:10 },

  statsRow: {
    display:'grid',
    gridTemplateColumns:'repeat(3,1fr)',
    gap:24,
    marginBottom:50
  },

  statCard: {
    background:'rgba(255,255,255,0.05)',
    backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:20,
    padding:30,
    textAlign:'center',
    boxShadow:'0 20px 60px rgba(99,102,241,0.15)'
  },

  statNumber: {
    fontSize:40,
    fontWeight:800,
    color:'#a78bfa'
  },

  statLabel: { marginTop:8, color:'#94a3b8' },

  sectionTitle: { fontSize:20, fontWeight:700, marginBottom:20 },

  emptyCard: {
    marginTop:30,
    background:'rgba(255,255,255,0.05)',
    backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:24,
    padding:'60px 20px',
    textAlign:'center'
  },

  grid: {
    display:'grid',
    gridTemplateColumns:'repeat(3,1fr)',
    gap:24
  },

  card: {
    background:'rgba(255,255,255,0.05)',
    backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:20,
    padding:24
  },

  cardTop: {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:12
  },

  grade: { fontSize:20, fontWeight:800 },

  cardRole: { fontSize:16, fontWeight:600, textTransform:'capitalize' },

  cardMeta: { fontSize:13, color:'#94a3b8', marginTop:4 },

  cardScore: { fontSize:28, fontWeight:800, color:'#a78bfa', marginTop:10 },

  cardDate: { fontSize:12, color:'#64748b', marginTop:4 }
};