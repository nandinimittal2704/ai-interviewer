import { useNavigate, useEffect, useState } from "react-router-dom";
import interviewImg from "../assets/interview.png"
import cutoutImg from "../assets/cutout.png.png"
import "../App.css";

export default function Home(){

const navigate = useNavigate();
const [heroOpacity, setHeroOpacity] = useState(1);

useEffect(() => {
  const handleScroll = () => {
    const heroSection = document.getElementById('hero-section');
    if (heroSection) {
      const rect = heroSection.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Calculate opacity based on scroll position
      // When section is at top of viewport (0), opacity = 1
      // When section has scrolled past top, opacity decreases
      const opacity = Math.max(0, 1 - (Math.abs(sectionTop) / sectionHeight));
      setHeroOpacity(opacity);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

return(

<div className="home">

{/* NAVBAR */}

<nav className="navbar">

<h2 className="logo">VOCA AI</h2>

<div className="nav-links">
<a>HOME</a>
<a>AI INTERVIEW PRACTICE</a>
<a>COMMUNICATION PRACTICE</a>
<a onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })} style={{cursor: 'pointer'}}>FAQ</a>
</div>

<button
className="login-btn"
onClick={()=>navigate("/login")}
>
Sign-in
</button>

</nav>


{/* HERO */}

<section className="hero" id="hero-section" style={{opacity: heroOpacity, transition: 'opacity 0.3s ease'}}>

<div className="hero-content">

<div className="hero-left">

<h1>AI Powered Interview</h1>

<p>
Train with an AI interviewer, get instant feedback,
refine your answers, and boost confidence for real interviews.
</p>

<div className="hero-buttons">

<button
className="primary-btn"
onClick={()=>navigate("/signup")}
>
Try AI Mock Interview
</button>

</div>

</div>

<div className="hero-right">

<img src={cutoutImg} alt="AI Interview" className="hero-image" />

</div>

</div>

</section>

{/* INTERVIEW CTA SECTION */}

<section className="interview-section">

<div className="interview-container">

<div className="interview-left">

<h2>
Interview Coming Up?<br/>
Feeling Unprepared?
</h2>

<p>
Our AI platform helps you master interviews and
communication so you can walk in prepared and confident.
</p>

<button
className="primary-btn"
onClick={()=>navigate("/login")}
>
Try AI Mock Interview
</button>

</div>

<div className="interview-right">

<img
src={interviewImg}
alt="AI Interview"
/>

</div>

</div>

</section>

{/* FEATURES SECTION */}

<section className="features">

<h2 className="features-title">
From students to professionals <br/>
<span>VOCA AI helps you grow</span>
</h2>

<div className="features-grid">

<div className="feature-card">
<div className="feature-icon"></div>
<h3>Detailed Performance Insights</h3>
<p>
Track scores, strengths and weaknesses after every interview session.
</p>
</div>

<div className="feature-card">
<div className="feature-icon"></div>
<h3>Friendly AI Coach</h3>
<p>
Practice interviews with an AI interviewer that gives real-time feedback.
</p>
</div>

<div className="feature-card">
<div className="feature-icon"></div>
<h3>70% Improvement</h3>
<p>
Most users improve interview performance after consistent practice.
</p>
</div>

</div>

</section>

{/* FAQ SECTION */}

<section className="faq" id="faq-section">

<h2 className="faq-title">FAQs</h2>

<div className="faq-grid">

<div className="faq-item">
<h3>How are the mock interview questions curated?</h3>
<p>
Our AI generates role-based questions using industry interview patterns
and evaluates answers with structured feedback.
</p>
</div>

<div className="faq-item">
<h3>Can our AI make mistakes in providing feedback?</h3>
<p>
While AI aims to provide accurate insights, responses should be used as
guidance to improve interview skills.
</p>
</div>

<div className="faq-item">
<h3>Are the company interview questions verified?</h3>
<p>
Questions are inspired by common interview patterns across companies
but are not officially affiliated with any organization.
</p>
</div>

<div className="faq-item">
<h3>Do you support integrations for organizations?</h3>
<p>
Yes, we are working on enterprise integrations for universities and
training platforms.
</p>
</div>

<div className="faq-item">
<h3>Is my data secure while using the platform?</h3>
<p>
All interview sessions and responses are securely stored and protected
using industry best practices.
</p>
</div>

</div>

</section>

</div>

)
}