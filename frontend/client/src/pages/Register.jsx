import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
import signup from "../../public/signup.png";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/auth/register", form);
      
      localStorage.setItem("token", response.data.token);
      if(response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      setSuccess("Account created! Redirecting...");
      setTimeout(() => navigate("/"), 3000); // Added delay for message visibility

    } catch (err) {
      if(err.response) {
        if(err.response.data.errors) {
          setError(Object.values(err.response.data.errors).join(", "));
        } else {
          setError(err.response.data.message || "Registration failed");
        }
      } else {
        setError(err.message.includes("Failed to fetch")
          ? "Server not responding - check backend connection"
          : "Network error - please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-left">
          <h1>Making property hunting simple, secure and stress-free</h1>
          <p>Sign up to start</p>

          <button className="google-signin">
            <img
              src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
              alt="Google"
              style={{
                width: "20px",
                marginRight: "10px",
                verticalAlign: "middle",
              }}
            />
            <span style={{ fontWeight: "Extra bold" }}>Sign in with Google</span>
          </button>

          <div className="separator">
            <hr />
            <span>or</span>
            <hr />
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              Name<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label>
              Email<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>
              Password<span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              minLength="6"
            />

            <label>
              Role<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="role-dropdown"
              required
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              className="create-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            {error && (
              <div className="error-message">
                <i className="error-icon">⚠️</i> {error}
              </div>
            )}

            {/* Added Success Message Section */}
            {success && (
              <div className="elegant-success-message">
                <div className="success-line-animate"></div>
                <h3 className="success-heading">
                  Welcome to Our Community!
                </h3>
                <p className="success-subtext">
                  Your journey begins now. Redirecting to your personalized dashboard...
                </p>
              </div>
            )}
          </form>

          <div className="login-link">
            <span>
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight: "Extra bold" }}>
                Login Here
              </Link>
            </span>
          </div>
        </div>

        <div className="register-right">
          <img src={signup} alt="Family" />
        </div>
      </div>
    </div>
  );
};

export default Register;
