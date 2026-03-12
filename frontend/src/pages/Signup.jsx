import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../config.js";

export default function Signup() {

  const [form,setForm] = useState({
    name:"",
    email:"",
    password:""
  });

  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const nav = useNavigate();

  const submit = async () => {

    setError("");
    setLoading(true);

    try{

      const res = await axios.post(`${API_URL}/api/auth/signup`,form);

      localStorage.setItem("token",res.data.token);
      localStorage.setItem("user",JSON.stringify(res.data.user));

      nav("/dashboard");

    }catch(err){

      setError(err.response?.data?.message || "Signup failed");

    }

    setLoading(false);
  };


return(

<div style={s.wrap}>

<div style={s.card}>

<div style={s.logo}>🤖</div>

<h1 style={s.title}>Create Account</h1>

<p style={s.sub}>Start practicing interviews with AI</p>

{error && <p style={s.error}>{error}</p>}

<input
style={s.input}
placeholder="Full Name"
value={form.name}
onChange={(e)=>setForm({...form,name:e.target.value})}
/>

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
{loading ? "Creating..." : "Create Account"}
</button>

<p style={s.foot}>
Already have an account? 
<Link to="/login" style={s.link}> Sign in</Link>
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