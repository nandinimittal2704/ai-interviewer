import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying Google sign-in...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const id = params.get("id");
    const error = params.get("error");

    if (error) {
      setMessage("Google authentication failed. Please try again.");
      return;
    }

    if (token && name && email) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id, name, email }));
      navigate("/dashboard");
      return;
    }

    setMessage("Google login did not return valid credentials.");
  }, [navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Google Sign-In</h1>
        <p style={styles.message}>{message}</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#050505",
    color: "#f8fafc",
    fontFamily: "Inter, sans-serif",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 32,
    borderRadius: 24,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: "#cbd5e1",
  },
};
