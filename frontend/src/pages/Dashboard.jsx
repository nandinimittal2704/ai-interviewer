import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config.js";

const ROLE_ICONS = {
  frontend: "⚛️",
  backend: "⚙️",
  fullstack: "🔗",
  dsa: "🧮",
  system: "🏗️",
  hr: "🤝",
};

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user") || "{}"));

    axios
      .get(`${API_URL}/api/sessions/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((r) => {
        setSessions(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  const avg = sessions.length
    ? (
        sessions.reduce((s, x) => s + x.overallScore, 0) / sessions.length
      ).toFixed(1)
    : "0.0";

  const strongPerf = sessions.filter((s) =>
    ["A", "B"].includes(s.grade)
  ).length;

  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div style={s.wrap}>
      <div className="lines-bg"></div>
      <div className="content">
      <style>{`
*{box-sizing:border-box}

.card:hover{
  transform:translateY(-4px);
  border-color:#00ff66;
  box-shadow:0 0 20px rgba(0,255,102,0.3);
}

.retry-btn:hover{
  background:#00ff66;
  color:black;
  box-shadow:0 0 15px rgba(0,255,102,0.4);
}

.welcome-text{
  background:linear-gradient(90deg,#ffffff,#00ff00);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

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

.content{
  position:relative;
  z-index:1;
}
`}</style>

      {/* HEADER */}

      <header style={s.header}>
        <div style={s.logo}>
          🤖 <span>AI Interviewer</span>
        </div>

        <div style={s.headerRight}>
          <span style={s.username}>{user.name}</span>

          <button style={s.newBtn} onClick={() => nav("/interview")}>
            + New Interview
          </button>

          <button style={s.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main style={s.main}>
        <h1 style={s.title} className="welcome-text">
          Welcome back, {firstName} 👋
        </h1>

        <p style={s.subtitle}>
          Let's sharpen your interview skills today.
        </p>

        {/* STATS */}

        <div style={s.stats}>

          <div className="card" style={s.statCard}>
            <h3>{sessions.length}</h3>
            <p>Interviews</p>
          </div>

          <div className="card" style={s.statCard}>
            <h3>{avg}</h3>
            <p>Average Score</p>
          </div>

          <div className="card" style={s.statCard}>
            <h3>{strongPerf}</h3>
            <p>Strong Performances</p>
          </div>

        </div>

        {/* INTERVIEW LIST */}

        <div style={s.tableWrap}>
          <h2 style={s.sectionTitle}>Recent Interviews</h2>

          {loading ? (
            <p style={{color:"#aaa"}}>Loading...</p>
          ) : sessions.length === 0 ? (
            <div style={s.empty}>
              <h3>No interviews yet</h3>
              <p>Start your first AI mock interview</p>

              <button style={s.startBtn}
                onClick={() => nav("/interview")}
              >
                Start Interview
              </button>
            </div>
          ) : (
            <div style={s.table}>
              {sessions.map((sess) => (
                <div key={sess._id} style={s.row}>

                  <div style={s.role}>
                    {ROLE_ICONS[sess.role]} {sess.role}
                  </div>

                  <div>{sess.difficulty}</div>

                  <div>{sess.overallScore}/10</div>

                  <div>
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </div>

                  <button
                    className="retry-btn"
                    style={s.retryBtn}
                    onClick={() => nav("/interview")}
                  >
                    Retry
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}

const s = {

wrap:{
minHeight:"100vh",
background:"#050505",
color:"white",
fontFamily:"Inter",
position:"relative"
},

header:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"20px 60px",
borderBottom:"1px solid #1f1f1f"
},

logo:{
fontSize:20,
fontWeight:700
},

headerRight:{
display:"flex",
alignItems:"center",
gap:15
},

username:{
color:"#aaa",
fontSize:14
},

newBtn:{
background:"#00ff66",
border:"none",
borderRadius:30,
padding:"8px 18px",
cursor:"pointer",
fontWeight:600,
transition:"0.3s"
},

logoutBtn:{
background:"transparent",
border:"1px solid #333",
color:"#aaa",
borderRadius:20,
padding:"8px 16px",
cursor:"pointer"
},

main:{
maxWidth:1000,
margin:"auto",
padding:"40px 20px"
},

title:{
fontSize:32,
marginBottom:6
},

subtitle:{
color:"#888",
marginBottom:40
},

stats:{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:20,
marginBottom:50
},

statCard:{
background:"rgba(255,255,255,0.04)",
border:"1px solid rgba(255,255,255,0.08)",
padding:25,
borderRadius:18,
textAlign:"center",
transition:"0.3s"
},

tableWrap:{
marginTop:30
},

sectionTitle:{
marginBottom:20
},

table:{
display:"flex",
flexDirection:"column",
gap:12
},

row:{
display:"grid",
gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",
background:"rgba(255,255,255,0.03)",
padding:"14px 18px",
borderRadius:12,
alignItems:"center"
},

role:{
display:"flex",
alignItems:"center",
gap:8,
textTransform:"capitalize"
},

retryBtn:{
border:"1px solid #00ff66",
background:"transparent",
color:"#00ff66",
borderRadius:20,
padding:"6px 14px",
cursor:"pointer",
transition:"0.3s"
},

empty:{
textAlign:"center",
padding:"60px"
},

startBtn:{
marginTop:15,
background:"#00ff66",
border:"none",
borderRadius:30,
padding:"12px 26px",
cursor:"pointer",
fontWeight:600,
transition:"0.3s"
}

};