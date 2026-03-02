import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>🤖</div>
        <h1 style={s.title}>AI Interviewer</h1>
        <p style={s.sub}>Sign in to practice interviews</p>
        {error && <p style={s.error}>{error}</p>}
        <input style={s.input} placeholder="Email" type="email"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input style={s.input} placeholder="Password" type="password"
          value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <button style={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
        <p style={s.foot}>No account? <Link to="/signup" style={s.link}>Sign up</Link></p>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top left, #1e1b4b, #0f172a 60%)',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 45,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },

  logo: {
    fontSize: 54,
    textAlign: 'center',
    marginBottom: 5,
  },

  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },

  sub: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 15,
  },

  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid #ef4444',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
  },

  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '14px 18px',
    fontSize: 15,
    color: '#e2e8f0',
    outline: 'none',
    width: '100%',
    transition: 'all 0.2s ease',
  },

  btn: {
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    border: 'none',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    marginTop: 10,
    transition: 'all 0.3s ease',
  },

  foot: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },

  link: {
    color: '#a5b4fc',
    textDecoration: 'none',
    fontWeight: 600,
  },
};