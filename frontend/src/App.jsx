import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Interview from "./pages/Interview.jsx";

const isAuth = () => !!localStorage.getItem("token");

function PrivateRoute({ children }) {
  return isAuth() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>

      {/* Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Pages */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/interview"
        element={
          <PrivateRoute>
            <Interview />
          </PrivateRoute>
        }
      />

    </Routes>
  );
}