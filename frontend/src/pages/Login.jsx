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
  setError('');

  const email = form.email.trim();
  const password = form.password;

  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

  if (!emailRegex.test(email)) {
    setError('Please enter a valid email ending with .com');
    return;
  }

  if (password.length < 8) {
    setError('Password must be at least 8 characters long');
    return;
  }

  setLoading(true);

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
  wrap: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0f' },
  card: { width:'100%', maxWidth:400, background:'#111118', border:'1px solid #1e1e2e', borderRadius:20, padding:40, display:'flex', flexDirection:'column', gap:14 },
  logo: { fontSize:48, textAlign:'center' },
  title: { fontSize:26, fontWeight:800, color:'#fff', textAlign:'center' },
  sub: { fontSize:14, color:'#555', textAlign:'center', marginBottom:6 },
  error: { background:'#3f0f0f', border:'1px solid #ef4444', color:'#ef4444', padding:'10px 14px', borderRadius:8, fontSize:13 },
  input: { background:'#0d0d15', border:'1px solid #1e1e2e', borderRadius:10, padding:'12px 16px', fontSize:15, color:'#e2e8f0', outline:'none', width:'100%' },
  btn: { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, padding:14, fontSize:15, fontWeight:600, color:'#fff', cursor:'pointer' },
  foot: { fontSize:13, color:'#555', textAlign:'center' },
  link: { color:'#6366f1', textDecoration:'none' },
};