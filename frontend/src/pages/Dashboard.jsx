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
      <div style={s.header}>
        <h1 style={s.logo}>🤖 AI Interviewer</h1>
        <div style={s.headerRight}>
          <span style={s.welcome}>Hi, {user.name}!</span>
          <button style={s.newBtn} onClick={() => nav('/interview')}>+ New Interview</button>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.statsRow}>
          {[['Total', sessions.length], ['Avg Score', avg], ['Good Grades', sessions.filter(s=>['A','B'].includes(s.grade)).length]].map(([label, val]) => (
            <div key={label} style={s.stat}>
              <span style={s.statVal}>{val}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        <h2 style={s.sectionTitle}>Past Interviews</h2>

        {sessions.length === 0 ? (
          <div style={s.empty}>
            <p style={{fontSize:48}}>🎯</p>
            <p style={{color:'#555',marginTop:12}}>No interviews yet. Start your first one!</p>
            <button style={{...s.newBtn, marginTop:20}} onClick={() => nav('/interview')}>Start Interview</button>
          </div>
        ) : (
          <div style={s.grid}>
            {sessions.map(sess => (
              <div key={sess._id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={{fontSize:28}}>{ICONS[sess.role] || '💼'}</span>
                  <span style={{...s.grade, color: GRADE_COLOR[sess.grade]}}>{sess.grade}</span>
                </div>
                <p style={s.cardRole}>{sess.role}</p>
                <p style={s.cardMeta}>{sess.difficulty} · {sess.totalQuestions}Q</p>
                <p style={s.cardScore}>{sess.overallScore}/10</p>
                <p style={s.cardDate}>{new Date(sess.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: { minHeight:'100vh', background:'#0a0a0f' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 40px', background:'#111118', borderBottom:'1px solid #1e1e2e' },
  logo: { fontSize:22, fontWeight:800, color:'#fff' },
  headerRight: { display:'flex', alignItems:'center', gap:12 },
  welcome: { fontSize:14, color:'#555' },
  newBtn: { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, padding:'10px 20px', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' },
  logoutBtn: { background:'transparent', border:'1px solid #1e1e2e', borderRadius:10, padding:'10px 20px', color:'#555', fontSize:14, cursor:'pointer' },
  body: { maxWidth:900, margin:'0 auto', padding:'40px 24px' },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:40 },
  stat: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:16, padding:24, display:'flex', flexDirection:'column', gap:6 },
  statVal: { fontSize:36, fontWeight:800, color:'#6366f1' },
  statLabel: { fontSize:13, color:'#555' },
  sectionTitle: { fontSize:18, fontWeight:700, color:'#fff', marginBottom:20 },
  empty: { textAlign:'center', padding:'60px 0' },
  grid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 },
  card: { background:'#111118', border:'1px solid #1e1e2e', borderRadius:16, padding:24 },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  grade: { fontSize:20, fontWeight:800 },
  cardRole: { fontSize:15, fontWeight:600, color:'#e2e8f0', textTransform:'capitalize' },
  cardMeta: { fontSize:13, color:'#555', marginTop:4 },
  cardScore: { fontSize:28, fontWeight:800, color:'#6366f1', marginTop:8 },
  cardDate: { fontSize:12, color:'#333', marginTop:4 },
};
