import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import signupImage from "../../public/signup.png";
import { useAuth } from "../context/AuthContext"; 
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const Login = () => {
  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(""); 
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      
      const result = await login(form.email, form.password);
      
      if (result.success) {
        setSuccess("Login successful. Seamless access granted.");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
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
    <>
      <Navbar />
      <div className="login-wrapper">
      <div className="login-card">
        <div className="login-left">
          <h2>Login to enjoy a customized and hassle-free experience</h2>



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
            {success && (
                <div className="minimal-success">
                    <p className="success-text">
                        Seamless access granted. <span className="highlight"> Happy property hunting! →</span>
                    </p>
                    <div className="thin-line"></div>
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
    <Footer />
    </>
  );
};

export default Login;
