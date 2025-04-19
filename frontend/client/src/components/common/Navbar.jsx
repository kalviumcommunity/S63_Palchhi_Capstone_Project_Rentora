import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/Navbar.css";
import logo from "../../../public/rentora-logo.png";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">HOME</Link>
        <a href="#">SELL</a>
        <a href="#">RENT</a>
        <a href="#">BUY</a>
      </div>
      <div className="navbar-center">
        <img src={logo} alt="Rentora Trusted Homes" className="navbar-logo" />
      </div>
      <div className="navbar-right">
        <button className="btn btn-login" onClick={() => navigate('/login')}>
          Login
        </button>
        <Link to="/register">
          <button className="btn btn-signup">Sign Up</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
