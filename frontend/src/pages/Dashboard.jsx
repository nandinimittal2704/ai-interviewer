import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config.js';

const ROLE_ICONS = { frontend:'⚛️', backend:'⚙️', fullstack:'🔗', dsa:'🧮', system:'🏗️', hr:'🤝' };
const GRADE_COLOR = { A:'#22c55e', B:'#6366f1', C:'#f59e0b', D:'#f97316', F:'#ef4444' };
const GRADE_BG = { A:'#22c55e18', B:'#6366f118', C:'#f59e0b18', D:'#f9731618', F:'#ef444418' };

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    axios.get(`${API_URL}/api/sessions/my`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => { setSessions(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const logout = () => { localStorage.clear(); nav('/login'); };
  const avg = sessions.length
    ? (sessions.reduce((s, x) => s + x.overallScore, 0) / sessions.length).toFixed(1)
    : '0.0';
  const strongPerf = sessions.filter(s => ['A','B'].includes(s.grade)).length;
  const firstName = user.name?.split(' ')[0] || 'there';

  return (
    <div style={s.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07060f; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
        .stat-card:hover { transform: translateY(-2px); border-color: #6366f144 !important; transition: all 0.3s; }
        .session-row:hover { background: #ffffff08 !important; transition: all 0.2s; }
        .new-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px #6366f155; transition: all 0.2s; }
        .start-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px #6366f155; transition: all 0.2s; }
      `}</style>

      {/* Background */}
      <div style={s.bg}>
        <div style={s.bgOrb1} />
        <div style={s.bgOrb2} />
        <div style={s.bgOrb3} />
        <div style={s.bgGrid} />
      </div>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoMark}>🤖</div>
          <span style={s.logoText}>AI Interviewer</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.userName}>{user.name}</span>
          <button className="new-btn" style={s.newBtn} onClick={() => nav('/interview')}>
            + New Interview
          </button>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Body */}
      <main style={s.main}>

        {/* Welcome */}
        <div style={s.welcomeSection}>
          <h1 style={s.welcomeTitle}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={s.welcomeSub}>Let's sharpen your interview skills today.</p>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div className="stat-card" style={s.statCard}>
            <div style={s.statTop}>
              <span style={s.statIcon}>📋</span>
            </div>
            <span style={s.statNum}>{sessions.length}</span>
            <span style={s.statLabel}>Interviews</span>
          </div>

          <div className="stat-card" style={{...s.statCard, ...s.statCardFeatured}}>
            <div style={s.statTop}>
              <span style={s.statIcon}>📈</span>
              <div style={s.miniChart}>
                <svg width="60" height="30" viewBox="0 0 60 30">
                  <polyline points="0,25 15,18 30,20 45,10 60,5"
                    fill="none" stroke="#6366f1" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                  <polyline points="0,25 15,18 30,20 45,10 60,5"
                    fill="url(#grad)" stroke="none"/>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div style={s.statNumRow}>
              <span style={{...s.statNum, color:'#a5b4fc'}}>{avg}</span>
              <span style={s.statNumSub}>/ 10</span>
            </div>
            <span style={s.statLabel}>Avg Score</span>
          </div>

          <div className="stat-card" style={s.statCard}>
            <div style={s.statTop}>
              <span style={s.statIcon}>🏆</span>
            </div>
            <span style={s.statNum}>{strongPerf}</span>
            <span style={s.statLabel}>Strong Performances</span>
          </div>
        </div>

        {/* Recent Interviews */}
        <div style={s.tableSection}>
          <h2 style={s.tableTitle}>Recent Interviews</h2>

          {loading ? (
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
            </div>
          ) : sessions.length === 0 ? (
            <div style={s.emptyCard}>
              <div style={s.emptyIcon}>🎯</div>
              <p style={s.emptyTitle}>No interviews yet</p>
              <p style={s.emptySub}>Start your first AI-powered mock interview and track your performance.</p>
              <button className="start-btn" style={s.startBtn} onClick={() => nav('/interview')}>
                Start New Interview
              </button>
            </div>
          ) : (
            <div style={s.tableCard}>
              {/* Table header */}
              <div style={s.tableHeader}>
                <span style={{...s.tableHead, flex:2}}>Role</span>
                <span style={s.tableHead}>Level</span>
                <span style={s.tableHead}>Score</span>
                <span style={s.tableHead}>Date</span>
                <span style={s.tableHead}>Action</span>
              </div>
              {/* Table rows */}
              {sessions.map((sess, i) => (
                <div key={sess._id} className="session-row" style={{
                  ...s.tableRow,
                  animationDelay: `${i * 0.05}s`,
                  animation: 'fadeUp 0.4s ease both'
                }}>
                  <div style={{...s.tableCell, flex:2, gap:12}}>
                    <span style={s.roleIconSmall}>{ROLE_ICONS[sess.role] || '💼'}</span>
                    <div>
                      <p style={s.roleName}>{sess.role}</p>
                      <p style={s.roleQuestions}>{sess.totalQuestions} questions</p>
                    </div>
                  </div>
                  <div style={s.tableCell}>
                    <span style={s.levelBadge}>{sess.difficulty}</span>
                  </div>
                  <div style={s.tableCell}>
                    <div style={{
                      ...s.gradeBadge,
                      color: GRADE_COLOR[sess.grade] || '#fff',
                      background: GRADE_BG[sess.grade] || '#ffffff10',
                      border: `1px solid ${GRADE_COLOR[sess.grade]}44`
                    }}>
                      <span style={s.gradeScore}>{sess.overallScore}</span>
                      <span style={s.gradeOf}>/10</span>
                      <span style={s.gradeLetter}>{sess.grade}</span>
                    </div>
                  </div>
                  <div style={s.tableCell}>
                    <span style={s.dateText}>
                      {new Date(sess.createdAt).toLocaleDateString('en-IN', {
                        day:'numeric', month:'short', year:'numeric'
                      })}
                    </span>
                  </div>
                  <div style={s.tableCell}>
                    <button style={s.viewBtn} onClick={() => nav('/interview')}>
                      Retry →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

const s = {
  wrap: {
    minHeight: '100vh',
    background: '#07060f',
    fontFamily: "'Outfit', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  // Background
  bg: { position:'fixed', inset:0, zIndex:0, pointerEvents:'none' },
  bgOrb1: {
    position:'absolute', width:600, height:600,
    borderRadius:'50%', top:'-20%', left:'-10%',
    background:'radial-gradient(circle, #4f46e540 0%, transparent 70%)',
    filter:'blur(40px)',
  },
  bgOrb2: {
    position:'absolute', width:500, height:500,
    borderRadius:'50%', top:'10%', right:'-10%',
    background:'radial-gradient(circle, #7c3aed30 0%, transparent 70%)',
    filter:'blur(50px)',
    animation:'shimmer 6s ease infinite',
  },
  bgOrb3: {
    position:'absolute', width:400, height:400,
    borderRadius:'50%', bottom:'-10%', left:'30%',
    background:'radial-gradient(circle, #312e8130 0%, transparent 70%)',
    filter:'blur(40px)',
  },
  bgGrid: {
    position:'absolute', inset:0,
    backgroundImage:`linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)`,
    backgroundSize:'40px 40px',
  },

  // Header
  header: {
    position:'relative', zIndex:10,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'18px 40px',
    background:'rgba(255,255,255,0.03)',
    borderBottom:'1px solid rgba(255,255,255,0.06)',
    backdropFilter:'blur(20px)',
  },
  headerLeft: { display:'flex', alignItems:'center', gap:10 },
  logoMark: { fontSize:24 },
  logoText: { fontSize:18, fontWeight:700, color:'#fff', letterSpacing:'-0.3px' },
  headerRight: { display:'flex', alignItems:'center', gap:14 },
  userName: { fontSize:14, color:'#94a3b8', fontWeight:500 },
  newBtn: {
    background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border:'none', borderRadius:10, padding:'9px 20px',
    color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer',
    letterSpacing:'-0.2px',
  },
  logoutBtn: {
    background:'transparent', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:10, padding:'9px 18px', color:'#64748b',
    fontSize:14, cursor:'pointer',
  },

  // Main
  main: {
    position:'relative', zIndex:1,
    maxWidth:1000, margin:'0 auto',
    padding:'48px 24px 80px',
  },

  // Welcome
  welcomeSection: { marginBottom:40, animation:'fadeUp 0.5s ease' },
  welcomeTitle: {
    fontSize:32, fontWeight:800, color:'#fff',
    letterSpacing:'-0.8px', marginBottom:8,
  },
  welcomeSub: { fontSize:16, color:'#64748b', fontWeight:400 },

  // Stats
  statsGrid: {
    display:'grid', gridTemplateColumns:'repeat(3,1fr)',
    gap:16, marginBottom:48,
  },
  statCard: {
    background:'rgba(255,255,255,0.03)',
    border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:20, padding:'24px 28px',
    display:'flex', flexDirection:'column', gap:8,
    cursor:'default', animation:'fadeUp 0.5s ease both',
  },
  statCardFeatured: {
    background:'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
    border:'1px solid rgba(99,102,241,0.25)',
  },
  statTop: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  statIcon: { fontSize:20 },
  miniChart: { opacity:0.8 },
  statNum: { fontSize:40, fontWeight:800, color:'#fff', letterSpacing:'-1px', lineHeight:1 },
  statNumRow: { display:'flex', alignItems:'baseline', gap:4 },
  statNumSub: { fontSize:18, color:'#64748b', fontWeight:500 },
  statLabel: { fontSize:13, color:'#64748b', fontWeight:500 },

  // Table
  tableSection: { animation:'fadeUp 0.6s ease 0.1s both' },
  tableTitle: { fontSize:18, fontWeight:700, color:'#fff', marginBottom:20, letterSpacing:'-0.3px' },
  loadingWrap: { display:'flex', justifyContent:'center', padding:'60px 0' },
  spinner: {
    width:36, height:36, border:'3px solid #1e1e2e',
    borderTop:'3px solid #6366f1', borderRadius:'50%',
    animation:'spin 0.8s linear infinite',
  },

  // Empty state
  emptyCard: {
    background:'rgba(255,255,255,0.02)',
    border:'1px solid rgba(255,255,255,0.06)',
    borderRadius:20, padding:'60px 40px',
    display:'flex', flexDirection:'column',
    alignItems:'center', gap:12, textAlign:'center',
  },
  emptyIcon: { fontSize:48, marginBottom:8, animation:'float 3s ease infinite' },
  emptyTitle: { fontSize:20, fontWeight:700, color:'#fff' },
  emptySub: { fontSize:15, color:'#64748b', maxWidth:340, lineHeight:1.6 },
  startBtn: {
    background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border:'none', borderRadius:12, padding:'12px 28px',
    color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer',
    marginTop:8,
  },

  // Table card
  tableCard: {
    background:'rgba(255,255,255,0.02)',
    border:'1px solid rgba(255,255,255,0.06)',
    borderRadius:20, overflow:'hidden',
  },
  tableHeader: {
    display:'flex', alignItems:'center',
    padding:'14px 24px',
    borderBottom:'1px solid rgba(255,255,255,0.05)',
    background:'rgba(255,255,255,0.02)',
  },
  tableHead: {
    flex:1, fontSize:12, fontWeight:600,
    color:'#475569', textTransform:'uppercase', letterSpacing:1,
  },
  tableRow: {
    display:'flex', alignItems:'center',
    padding:'16px 24px',
    borderBottom:'1px solid rgba(255,255,255,0.04)',
    cursor:'default',
  },
  tableCell: { flex:1, display:'flex', alignItems:'center' },
  roleIconSmall: { fontSize:22, marginRight:12 },
  roleName: { fontSize:14, fontWeight:600, color:'#e2e8f0', textTransform:'capitalize' },
  roleQuestions: { fontSize:12, color:'#475569', marginTop:2 },
  levelBadge: {
    background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:50, padding:'4px 12px',
    fontSize:12, color:'#94a3b8', fontWeight:500,
  },
  gradeBadge: {
    display:'flex', alignItems:'center', gap:4,
    borderRadius:8, padding:'6px 12px',
  },
  gradeScore: { fontSize:15, fontWeight:800 },
  gradeOf: { fontSize:12, opacity:0.6 },
  gradeLetter: { fontSize:12, fontWeight:700, marginLeft:4, opacity:0.8 },
  dateText: { fontSize:13, color:'#64748b' },
  viewBtn: {
    background:'transparent',
    border:'1px solid rgba(99,102,241,0.3)',
    borderRadius:8, padding:'6px 14px',
    color:'#6366f1', fontSize:13, fontWeight:600,
    cursor:'pointer',
  },
};