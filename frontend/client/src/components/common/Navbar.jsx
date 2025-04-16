import React from "react";
import "../../styles/Navbar.css"; // Corrected path
import logo from "../../../public/rentora-logo.png";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <a href="#">HOME</a>
                <a href="#">SELL</a>
                <a href="#">RENT</a>
                <a href="#">BUY</a>
            </div>
            <div className="navbar-center">
                <img src={logo} alt="Rentora Trusted Homes" className="navbar-logo" />
            </div>
            <div className="navbar-right">
                <button className="btn btn-login">Login</button>
                <button className="btn btn-signup">Sign Up</button>
            </div>
        </nav>
    );
};

export default Navbar;
