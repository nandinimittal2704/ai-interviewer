import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config.js";

const ROLE_ICONS = {
  frontend: "", backend: "", fullstack: "",
  dsa: "", system: "", hr: "",
};

const GRADE_COLOR = {
  A: "#00ff7f", B: "#00cc66", C: "#f59e0b", D: "#f97316", F: "#ef4444",
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Satoshi:wght@300;400;500;700&display=swap');

:root {
  --green: #00ff7f;
  --green-dim: #00cc66;
  --green-glow: rgba(0,255,127,0.15);
  --green-border: rgba(0,255,127,0.2);
  --bg: #030705;
  --surface: #080f0a;
  --surface2: #0d160f;
  --border: rgba(255,255,255,0.07);
  --text: #edf5ef;
  --text-muted: #6b8070;
  --text-dim: #3a4a3e;
  --radius: 16px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.db-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Satoshi', sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
}

/* Grid background */
.db-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,255,127,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,127,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
  mask-image: radial-gradient(ellipse 100% 60% at 50% 0%, black 30%, transparent);
}

.db-root::after {
  content: '';
  position: fixed;
  top: -200px; left: 50%;
  transform: translateX(-50%);
  width: 800px; height: 500px;
  background: radial-gradient(circle, rgba(0,255,127,0.05), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.db-root > * { position: relative; z-index: 1; }

/* ── HEADER ── */
.db-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 60px;
  border-bottom: 1px solid var(--border);
  background: rgba(3,7,5,0.7);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.db-logo {
  font-family: 'Clash Display', sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--text);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}

.db-logo span { color: var(--green); }

.db-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.db-username {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  padding: 6px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
}

.db-new-btn {
  background: var(--green);
  border: none;
  border-radius: 999px;
  padding: 9px 20px;
  cursor: pointer;
  font-family: 'Satoshi', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #000;
  transition: all 0.22s;
  letter-spacing: 0.03em;
}

.db-new-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0,255,127,0.3);
}

.db-logout-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 999px;
  padding: 9px 18px;
  cursor: pointer;
  font-family: 'Satoshi', sans-serif;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.db-logout-btn:hover { border-color: #ef4444; color: #ef4444; }

/* ── MAIN ── */
.db-main {
  max-width: 1060px;
  margin: 0 auto;
  padding: 52px 24px 80px;
}

/* WELCOME */
.db-welcome {
  margin-bottom: 48px;
}

.db-welcome-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 10px;
}

.db-welcome-title {
  font-family: 'Clash Display', sans-serif;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
  background: linear-gradient(135deg, var(--text) 30%, var(--green) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.db-welcome-sub { font-size: 15px; color: var(--text-muted); }

/* STATS */
.db-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 52px;
}

.db-stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.db-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--green), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.db-stat-card:hover::before { opacity: 1; }

.db-stat-card:hover {
  border-color: var(--green-border);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,255,127,0.1);
}

.db-stat-icon {
  font-size: 24px;
  margin-bottom: 16px;
  display: block;
}

.db-stat-val {
  font-family: 'Clash Display', sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: var(--green);
  line-height: 1;
  margin-bottom: 6px;
}

.db-stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

/* SECTION HEADER */
.db-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.db-section-title {
  font-family: 'Clash Display', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
}

.db-section-title::before {
  content: '';
  display: block;
  width: 3px; height: 18px;
  background: var(--green);
  border-radius: 2px;
}

.db-count-badge {
  background: rgba(0,255,127,0.08);
  border: 1px solid var(--green-border);
  color: var(--green);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 700;
}

/* SESSIONS LIST */
.db-sessions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* TABLE HEADER */
.db-table-head {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px;
  padding: 10px 20px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-dim);
}

/* SESSION ROW */
.db-session-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
  align-items: center;
  transition: all 0.22s ease;
  position: relative;
  overflow: hidden;
}

.db-session-row::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--green);
  opacity: 0;
  transition: opacity 0.2s;
}

.db-session-row:hover::before { opacity: 1; }

.db-session-row:hover {
  border-color: var(--green-border);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0,255,127,0.08);
}

.db-session-role {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--text);
  text-transform: capitalize;
  font-size: 14px;
}

.db-session-role-icon {
  width: 34px; height: 34px;
  background: rgba(0,255,127,0.06);
  border: 1px solid var(--green-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.db-session-diff {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.db-session-score {
  font-family: 'Clash Display', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--green);
}

.db-session-date {
  font-size: 12px;
  color: var(--text-dim);
  font-weight: 500;
}

.db-grade-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border-radius: 6px;
  font-family: 'Clash Display', sans-serif;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid;
}

.db-retry-btn {
  background: transparent;
  border: 1px solid var(--green-border);
  color: var(--green);
  border-radius: 999px;
  padding: 6px 16px;
  cursor: pointer;
  font-family: 'Satoshi', sans-serif;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.db-retry-btn:hover {
  background: var(--green);
  color: #000;
  box-shadow: 0 4px 16px rgba(0,255,127,0.25);
}

/* EMPTY STATE */
.db-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
}

.db-empty-icon {
  font-size: 52px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.db-empty h3 {
  font-family: 'Clash Display', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.db-empty p {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 28px;
}

.db-empty-btn {
  background: var(--green);
  border: none;
  border-radius: 999px;
  padding: 13px 32px;
  cursor: pointer;
  font-family: 'Satoshi', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #000;
  transition: all 0.22s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.db-empty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(0,255,127,0.3);
}

/* LOADING */
.db-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: var(--text-muted);
  font-size: 14px;
}

.db-spinner {
  width: 20px; height: 20px;
  border: 2px solid var(--surface2);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* RESPONSIVE */
@media (max-width: 900px) {
  .db-header { padding: 16px 24px; }
  .db-stats { grid-template-columns: 1fr 1fr; }
  .db-table-head { display: none; }
  .db-session-row {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 10px;
  }
}

@media (max-width: 600px) {
  .db-header { padding: 14px 16px; }
  .db-main { padding: 32px 16px 60px; }
  .db-welcome-title { font-size: 28px; }
  .db-stats { grid-template-columns: 1fr; }
  .db-username { display: none; }
}
`;

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    axios
      .get(`${API_URL}/api/sessions/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((r) => { setSessions(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const logout = () => { localStorage.clear(); nav("/login"); };

  const avg = sessions.length
    ? (sessions.reduce((s, x) => s + x.overallScore, 0) / sessions.length).toFixed(1)
    : "0.0";

  const strongPerf = sessions.filter((s) => ["A", "B"].includes(s.grade)).length;
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">

        {/* ── HEADER ── */}
        <header className="db-header">
          <div className="db-logo">
            VOCA<span>AI</span>
          </div>
          <div className="db-header-right">
            <span className="db-username">{user.name}</span>
            <button className="db-new-btn" onClick={() => nav("/interview")}>
              + New Interview
            </button>
            <button className="db-logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="db-main">

          {/* WELCOME */}
          <div className="db-welcome">
            <div className="db-welcome-eyebrow">✦ Dashboard</div>
            <h1 className="db-welcome-title">
              Welcome back, {firstName} 
            </h1>
            <p className="db-welcome-sub">
              Let's sharpen your interview skills today.
            </p>
          </div>

          {/* STATS */}
          <div className="db-stats">
            <div className="db-stat-card">
              <span className="db-stat-icon"></span>
              <div className="db-stat-val">{sessions.length}</div>
              <div className="db-stat-label">Interviews</div>
            </div>
            <div className="db-stat-card">
              <span className="db-stat-icon"></span>
              <div className="db-stat-val">{avg}<span style={{ fontSize: 18, color: "var(--text-muted)" }}>/10</span></div>
              <div className="db-stat-label">Avg Score</div>
            </div>
            <div className="db-stat-card">
              <span className="db-stat-icon"></span>
              <div className="db-stat-val">{strongPerf}</div>
              <div className="db-stat-label">Strong Performances</div>
            </div>
          </div>

          {/* SESSIONS */}
          <div className="db-section-header">
            <h2 className="db-section-title">Recent Interviews</h2>
            {sessions.length > 0 && (
              <span className="db-count-badge">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {loading ? (
            <div className="db-loading">
              <div className="db-spinner" />
              <span>Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon"></div>
              <h3>No interviews yet</h3>
              <p>Start your first AI mock interview and track your progress here.</p>
              <button className="db-empty-btn" onClick={() => nav("/interview")}>
                Start Interview →
              </button>
            </div>
          ) : (
            <>
              <div className="db-table-head">
                <span>Role</span>
                <span>Difficulty</span>
                <span>Score</span>
                <span>Date</span>
                <span></span>
              </div>
              <div className="db-sessions-list">
                {sessions.map((sess) => (
                  <div key={sess._id} className="db-session-row">
                    <div className="db-session-role">
                      <div className="db-session-role-icon">
                        {ROLE_ICONS[sess.role] || ""}
                      </div>
                      {sess.role}
                    </div>
                    <div className="db-session-diff">{sess.difficulty}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="db-session-score">{sess.overallScore}/10</span>
                      {sess.grade && (
                        <span
                          className="db-grade-badge"
                          style={{
                            color: GRADE_COLOR[sess.grade] || "#00ff7f",
                            borderColor: GRADE_COLOR[sess.grade] || "#00ff7f",
                            background: `${GRADE_COLOR[sess.grade]}15` || "rgba(0,255,127,0.08)",
                          }}
                        >
                          {sess.grade}
                        </span>
                      )}
                    </div>
                    <div className="db-session-date">
                      {new Date(sess.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </div>
                    <button className="db-retry-btn" onClick={() => nav("/interview")}>
                      Retry
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}