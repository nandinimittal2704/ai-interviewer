import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import interviewImg from "../assets/interview.png";
import cutoutImg from "../assets/cutout.png.png";
import "../App.css";

export default function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const navScrolled = scrollY > 40;

  return (
    <div className="home">

      {/* ── NAVBAR ── */}
      <nav className={`navbar ${navScrolled ? "navbar--scrolled" : ""}`}>
        <h2 className="logo">VOCA<span>AI</span></h2>

        <div className={`nav-links ${menuOpen ? "nav-links--open" : ""}`}>
          <a onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMenuOpen(false); }}>Home</a>
          <a onClick={() => { navigate("/login"); setMenuOpen(false); }}>AI Interview</a>
          <a onClick={() => { navigate("/login"); setMenuOpen(false); }}>Communication</a>
          <a onClick={() => { document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }}>FAQ</a>
        </div>

        <div className="nav-right">
          <button className="login-btn" onClick={() => navigate("/login")}>Sign In</button>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="hero-section">
        <div className="hero-bg-glow" />
        <div className="hero-grid-overlay" />

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">✦ AI-Powered Interview Coach</div>
            <h1>
              Ace Every<br />
              <span className="hero-highlight">Interview</span><br />
              with AI
            </h1>
            <p>
              Train with an intelligent AI interviewer, receive instant feedback,
              refine your answers, and walk into every interview with confidence.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/signup")}>
                Start Practicing Free
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-ghost" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat"><span>10k+</span>Sessions</div>
              <div className="stat-divider" />
              <div className="stat"><span>95%</span>Satisfaction</div>
              <div className="stat-divider" />
              <div className="stat"><span>70%</span>Improvement</div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-image-wrap">
              <div className="hero-image-ring" />
              <img src={cutoutImg} alt="AI Interview" className="hero-image" />
              <div className="hero-card hero-card--score">
                <span className="card-dot" />
                <span>AI Score: <strong>9/10</strong></span>
              </div>
              <div className="hero-card hero-card--feedback">
                <span>💬 Great answer! Clear & concise.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section
        className={`cta-section reveal ${visibleSections["cta"] ? "revealed" : ""}`}
        id="cta"
        data-animate
      >
        <div className="cta-container">
          <div className="cta-left">
            <p className="cta-eyebrow">INTERVIEW PREP</p>
            <h2>Interview Coming Up?<br /><span>We've Got You.</span></h2>
            <p className="cta-body">
              Our AI platform helps you master interviews and communication
              skills so you can walk in prepared, polished, and confident.
            </p>
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Try AI Mock Interview
              <span className="btn-arrow">→</span>
            </button>
          </div>
          <div className="cta-right">
            <div className="cta-img-wrap">
              <img src={interviewImg} alt="Interview" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        className={`features reveal ${visibleSections["features"] ? "revealed" : ""}`}
        id="features"
        data-animate
      >
        <div className="section-tag">WHY VOCA AI</div>
        <h2 className="section-title">
          From students to professionals —<br />
          <span>VOCA AI helps you grow</span>
        </h2>

        <div className="features-grid">
          {[
            { icon: "📊", title: "Detailed Performance Insights", desc: "Track scores, strengths and weaknesses after every session with AI-generated analytics." },
            { icon: "🤖", title: "Friendly AI Coach", desc: "Practice with an AI that gives real-time, constructive feedback just like a real interviewer." },
            { icon: "🎯", title: "Role-Specific Questions", desc: "Get questions tailored to your target role — frontend, backend, DSA, system design, HR and more." },
            { icon: "🎙️", title: "Voice Input Support", desc: "Speak your answers naturally using voice input — just like in a real interview setting." },
            { icon: "📈", title: "70% Improvement Rate", desc: "Most users report significant improvement in interview confidence after consistent practice." },
            { icon: "⚡", title: "Instant Feedback", desc: "No waiting. Get scored and evaluated the moment you submit each answer." },
          ].map((f, i) => (
            <div
              className="feature-card"
              key={i}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        className={`how-section reveal ${visibleSections["how"] ? "revealed" : ""}`}
        id="how"
        data-animate
      >
        <div className="section-tag">HOW IT WORKS</div>
        <h2 className="section-title">Three steps to interview<br /><span>mastery</span></h2>

        <div className="steps-row">
          {[
            { num: "01", title: "Choose Your Role", desc: "Select your target role and difficulty level to get relevant interview questions." },
            { num: "02", title: "Answer Questions", desc: "Respond by typing or speaking. Our AI listens and evaluates your answers instantly." },
            { num: "03", title: "Get Your Report", desc: "Receive a detailed report with scores, feedback, strengths, and study recommendations." },
          ].map((s, i) => (
            <div className="step" key={i}>
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < 2 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        className={`faq reveal ${visibleSections["faq-section"] ? "revealed" : ""}`}
        id="faq-section"
        data-animate
      >
        <div className="section-tag">FAQ</div>
        <h2 className="section-title">Common <span>Questions</span></h2>

        <div className="faq-grid">
          {[
            { q: "How are mock interview questions curated?", a: "Our AI generates role-based questions using industry interview patterns and evaluates answers with structured, real-time feedback." },
            { q: "Can the AI make mistakes in feedback?", a: "While AI aims to provide accurate insights, responses should be used as guidance to help improve your interview skills." },
            { q: "Are company questions verified?", a: "Questions are inspired by common interview patterns across top companies but are not officially affiliated with any organization." },
            { q: "Do you support enterprise integrations?", a: "Yes, we are working on integrations for universities and corporate training platforms. Contact us for early access." },
            { q: "Is my data secure?", a: "All interview sessions and responses are securely stored and protected using industry-standard encryption practices." },
            { q: "Is there a free plan?", a: "Yes! You can start practicing for free. Premium plans with advanced analytics and unlimited sessions are coming soon." },
          ].map((f, i) => (
            <div className="faq-item" key={i}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="footer-cta">
        <div className="footer-cta-glow" />
        <h2>Ready to land your dream job?</h2>
        <p>Join thousands of candidates who improved their interview skills with VOCA AI.</p>
        <button className="btn-primary btn-lg" onClick={() => navigate("/signup")}>
          Get Started Free
          <span className="btn-arrow">→</span>
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <h2 className="logo">VOCA<span>AI</span></h2>
          <p>AI-powered interview practice for the modern job seeker.</p>
          <div className="footer-links">
            <a onClick={() => navigate("/login")}>Interview Practice</a>
            <a onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}>FAQ</a>
            <a onClick={() => navigate("/signup")}>Sign Up</a>
          </div>
          <p className="footer-copy">© 2025 VOCA AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}