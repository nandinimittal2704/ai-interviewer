import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../config.js";

export default function Login() {

  const [form,setForm] = useState({
    email:"",
    password:""
  });

  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const nav = useNavigate();

const submit = async () => {

  setError("");

  const email = form.email.trim();
  const password = form.password;

  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

  if(!emailRegex.test(email)){
    setError("Please enter a valid email ending with .com");
    return;
  }

  if(password.length < 8){
    setError("Password must be at least 8 characters long");
    return;
  }

  setLoading(true);

  try{

    const res = await axios.post(`${API_URL}/api/auth/login`,form);

    localStorage.setItem("token",res.data.token);
    localStorage.setItem("user",JSON.stringify(res.data.user));

    nav("/dashboard");

  }catch(err){

    setError(err.response?.data?.message || "Login failed");

  }

  setLoading(false);

};


return(

<div style={s.wrap}>

<div style={s.card}>

<div style={s.logo}>🤖</div>

<h1 style={s.title}>AI Interviewer</h1>

<p style={s.sub}>Sign in to practice interviews</p>

{error && <p style={s.error}>{error}</p>}

<input
style={s.input}
placeholder="Email"
type="email"
value={form.email}
onChange={(e)=>setForm({...form,email:e.target.value})}
/>

<input
style={s.input}
placeholder="Password"
type="password"
value={form.password}
onChange={(e)=>setForm({...form,password:e.target.value})}
/>

<button
style={s.btn}
onClick={submit}
disabled={loading}
>
{loading ? "Signing in..." : "Sign In"}
</button>

<div style={s.divider}>
  <span style={s.dividerLine}></span>
  <span style={s.dividerText}>OR</span>
  <span style={s.dividerLine}></span>
</div>

<a href={`${API_URL}/api/auth/google`} style={s.googleBtn}>
  Continue with Google
</a>

<p style={s.foot}>
No account?
<Link to="/signup" style={s.link}> Create account</Link>
</p>

</div>

</div>

);

}


const s = {

wrap:{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#050505",
fontFamily:"Inter"
},

card:{
width:"100%",
maxWidth:420,
background:"rgba(255,255,255,0.04)",
backdropFilter:"blur(20px)",
border:"1px solid rgba(255,255,255,0.08)",
borderRadius:24,
padding:40,
display:"flex",
flexDirection:"column",
gap:16,
boxShadow:"0 20px 60px rgba(0,0,0,0.6)"
},

logo:{
fontSize:42,
textAlign:"center"
},

title:{
fontSize:28,
fontWeight:700,
color:"#fff",
textAlign:"center"
},

sub:{
fontSize:14,
color:"#9ca3af",
textAlign:"center",
marginBottom:6
},

error:{
background:"#3f0f0f",
border:"1px solid #ef4444",
color:"#ef4444",
padding:"10px 14px",
borderRadius:8,
fontSize:13
},

input:{
background:"#0d0d15",
border:"1px solid #1e1e2e",
borderRadius:10,
padding:"13px 16px",
fontSize:15,
color:"#e2e8f0",
outline:"none",
width:"100%"
},

btn:{
background:"#00ff66",
border:"none",
borderRadius:40,
padding:14,
fontSize:16,
fontWeight:600,
color:"black",
cursor:"pointer",
transition:"0.25s"
},

googleBtn:{
background:"#00ff66",
border:"1px solid #2563eb",
borderRadius:40,
padding:14,
fontSize:15,
fontWeight:700,
color:"#ffffff",
textAlign:"center",
textDecoration:"none",
display:"flex",
alignItems:"center",
justifyContent:"center",
width:"100%",
gap:10,
marginTop:8,
transition:"background 0.2s"
},

googleBtnHover:{
background:"#00ff66"
},

divider:{
display:"flex",
alignItems:"center",
gap:12,
marginTop:12,
marginBottom:8
},

dividerLine:{
flex:1,
height:1,
background:"rgba(255,255,255,0.12)"
},

dividerText:{
fontSize:12,
color:"#94a3b8",
fontWeight:700
},

foot:{
fontSize:13,
color:"#888",
textAlign:"center"
},

link:{
color:"#00ff66",
textDecoration:"none",
fontWeight:500
}

};