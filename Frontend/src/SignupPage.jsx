import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignupPage() {
  const [details, setDetails] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState({
    usernameError: "",
    passwordError: "",
    confirmPasswordError: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (details.password !== details.confirmPassword) {
      setErr((prev) => ({ ...prev, confirmPasswordError: "Password Mismatch" }));
      setIsSubmitting(false);
      return;
    }
    
    try {
      const resp = await axios.post("/users/signup", {
        username: details.username,
        password: details.password,
      });
      
      if (resp.data === "Success") {
        setDetails({ username: "", password: "", confirmPassword: "" });
        setErr({ usernameError: "", passwordError: "", confirmPasswordError: "" });
        navigate("/");
      } else {
        setErr((prev) => ({ ...prev, usernameError: "Username Already Exists" }));
      }
    } catch (error) {
      setErr((prev) => ({ ...prev, usernameError: "Something went wrong. Please try again." }));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(e) {
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr((prev) => ({ ...prev, [`${e.target.name}Error`]: "" }));
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p className="subtitle">Sign up to start chatting.</p>

        <label htmlFor="un">Username</label>
        <input
          type="text"
          name="username"
          id="un"
          value={details.username}
          onChange={handleChange}
          placeholder="Choose a username"
          autoComplete="username"
          className={err.usernameError ? "error" : ""}
        />
        {err.usernameError && (
          <div className="field-error" role="alert">
            {err.usernameError}
          </div>
        )}

        <label htmlFor="pass">Password</label>
        <input
          type="password"
          name="password"
          id="pass"
          value={details.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
          className={err.passwordError ? "error" : ""}
        />
        {err.passwordError && (
          <div className="field-error" role="alert">
            {err.passwordError}
          </div>
        )}

        <label htmlFor="confpass">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          id="confpass"
          value={details.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
          className={err.confirmPasswordError ? "error" : ""}
        />
        {err.confirmPasswordError && (
          <div className="field-error" role="alert">
            {err.confirmPasswordError}
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </div>
        <p className="footer-link">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/")} className="link-button">
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}
