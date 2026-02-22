import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [details, setDetails] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({username:"",password:""});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {    e.preventDefault();
    setIsSubmitting(true);
    setErrors({username:"",password:""});

    try {
      const resp = await axios.post("/users/login", {
        username: details.username,
        password: details.password,
      });
      
      if (resp.data.status==="Success") {
        sessionStorage.setItem("token", resp.data.token);
        navigate("/CurrFriends");
      } else {
        setErrors(prev=>({...prev,[resp.data.field]:resp.data.status}));
      }
    } catch (error) {
      console.log("Error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(e) {
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev=>({...prev,[e.target.name]:""}));
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
          className={errors.username ? "error" : ""}
          required
        />
	{errors.username && (
  <div className="field-error">{errors.username}</div>
)}

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={details.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="current-password"
          className={errors.password ? "error" : ""}
          required
        />

        {errors.password && (
          <div className="field-error" role="alert">
            {errors.password}
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
