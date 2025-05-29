import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";
const signup = "/signup.png";
import axiosInstance from "../utils/axiosConfig";
import { useAuth } from "../context/AuthContext"; 
import Navbar from "../components/common/Navbar";

const Register = () => {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
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
    setSuccess("");
    setIsLoading(true);

    try {
    
      const response = await axiosInstance.post("/auth/register", form);
      
      if (response.data.success !== false) {
      
        const loginResult = await login(form.email, form.password);
        
        if (loginResult.success) {
          setSuccess("Account created! Redirecting...");
          setTimeout(() => navigate("/"), 2000); 
        } else {
    
          setSuccess("Account created! Please login to continue.");
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        setError(response.data.message || "Registration failed");
      }
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
    <>
      <Navbar />
      <div className="register-page">
      <div className="register-container">
        <div className="register-left">
          <h1>Making property hunting simple, secure and stress-free</h1>
          <p>Sign up to start</p>



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
    </>
  );
};

export default Register;
