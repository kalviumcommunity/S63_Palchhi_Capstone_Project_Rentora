import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import signupImage from "../../public/signup.png";
import api from "../axiosConfig"; // Import your configured axios instance

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      
      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-left">
          <h2>Login to enjoy a customized and hassle-free experience</h2>

          <button className="google-login-btn">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2702/2702602.png"
              alt="Google"
            />
            <span className="Signin">Sign in with Google</span>
          </button>

          <div className="separator">
            <hr />
            <span>or</span>
            <hr />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="login-input"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="login-input"
              value={form.password}
              onChange={handleChange}
              required
              minLength="6"
            />

            <button 
              type="submit" 
              className="continue-btn"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Continue"}
            </button>

            {error && (
              <div className="error-message">
                <i className="error-icon">⚠️</i> {error}
              </div>
            )}
          </form>

          <p className="register-link">
            Don't have an account? <Link to="/register">Register now.</Link>
          </p>
        </div>

        <div className="login-right">
          <img src={signupImage} alt="Login" />
        </div>
      </div>
    </div>
  );
};

export default Login;
