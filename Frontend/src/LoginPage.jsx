import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [details, setDetails] = useState({
    username: "",
    password: "",
  });
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setErr("");

    try {
      const resp = await axios.post("http://localhost:8080/users/login", {
        username: details.username,
        password: details.password,
      });
      
      if (resp.data.token) {
        sessionStorage.setItem("token", resp.data.token);
        navigate("/CurrFriends");
      } else {
        setErr("Invalid username or password");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setErr("Invalid username or password");
      } else {
        setErr("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(e) {
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr("");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to continue chatting.</p>

        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          value={details.username}
          onChange={handleChange}
          placeholder="Enter your username"
          autoComplete="username"
          className={err ? "error" : ""}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={details.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="current-password"
          className={err ? "error" : ""}
          required
        />

        {err && (
          <div className="field-error" role="alert">
            {err}
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </div>
        <p className="footer-link">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={() => navigate("/signup")} className="link-button">
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
}