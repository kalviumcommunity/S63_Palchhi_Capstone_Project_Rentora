import * as React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { TiLocationArrow } from "react-icons/ti";
import { pageTransition } from "../../utils/pageTransitions";
import { FaSearch, FaComments, FaHome, FaBuilding, FaKey, FaUser, FaSignOutAlt } from "react-icons/fa";

import "../../styles/Navbar.css";
import "../../styles/SearchBar.css";
import "../../styles/animations.css";
import logo from "/rentora-logo.png";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import SearchBar from "./SearchBar";
import { getUnreadCount } from "../../api/notificationApi";
import { isGoogleProfileImage, getSafeProfileImageUrl } from "../../utils/imageUtils";

// Default avatar as a data URL
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e5e7eb'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showSearchBar, setShowSearchBar] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const navContainerRef = React.useRef(null);

  // Add debug logging for user state changes
  React.useEffect(() => {
    console.log('Navbar - User state changed:', user);
    console.log('Navbar - Current token:', localStorage.getItem('token'));
  }, [user]);

  // Add debug logging for component mount
  React.useEffect(() => {
    console.log('Navbar mounted - Initial user state:', user);
    console.log('Navbar mounted - Initial token:', localStorage.getItem('token'));
  }, []);

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [googleImageFailed, setGoogleImageFailed] = React.useState(false);

  // Handle click outside dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle profile image loading
  React.useEffect(() => {
    if (user && user.profileImage) {
      if (!isGoogleProfileImage(user.profileImage)) {
        const img = new Image();
        img.src = user.profileImage.includes('http') 
          ? user.profileImage
          : `http://localhost:8000${user.profileImage}`;
        img.onerror = () => setGoogleImageFailed(true);
      }
    }
  }, [user]);

  // Handle scroll behavior
  React.useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current?.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current?.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current?.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  // Animate navbar visibility
  React.useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  const handleNavClick = (path) => {
    setShowDropdown(false);
    if (path === '/login' || path === '/register') {
      navigate(path);
    } else {
      pageTransition.navigate(navigate, path);
    }
  };

  const isPropertiesPage = location.pathname === '/properties';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const getProfileImageUrl = (imageUrl) => {
    if (!imageUrl) return defaultAvatar;
    
    try {
      if (imageUrl.includes('http')) {
        return imageUrl;
      }
      // Add timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${imageUrl}?t=${timestamp}`;
    } catch (error) {
      console.error('Error processing profile image URL:', error);
      return defaultAvatar;
    }
  };

  return (
    <div ref={navContainerRef} className="navbar-container">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="nav-item" onClick={(e) => {
            e.preventDefault();
            handleNavClick('/');
          }}>
            <FaHome className="nav-icon" /> HOME
          </Link>

          {user && (
            <Link to="/my-listings" className="nav-item" onClick={(e) => {
              e.preventDefault();
              handleNavClick('/my-listings');
            }}>
              <FaBuilding className="nav-icon" /> MY PROPERTIES
            </Link>
          )}

          <Link to="/properties?propertyType=rent" className="nav-item" onClick={(e) => {
            e.preventDefault();
            handleNavClick('/properties?propertyType=rent');
          }}>
            <FaKey className="nav-icon" /> RENT
          </Link>

          <Link to="/properties?propertyType=sale" className="nav-item" onClick={(e) => {
            e.preventDefault();
            handleNavClick('/properties?propertyType=sale');
          }}>
            <FaBuilding className="nav-icon" /> BUY
          </Link>
        </div>

        <div className="navbar-center">
          <Link to="/" onClick={(e) => {
            e.preventDefault();
            handleNavClick('/');
          }}>
            <img src={logo} alt="Rentora" className="navbar-logo" />
          </Link>
        </div>

        <div className="navbar-right">
          {!isPropertiesPage && (
            <div className="search-icon-container" ref={searchRef}>
              <button 
                className="search-icon-button" 
                onClick={() => setShowSearchBar(!showSearchBar)}
                title="Search Properties"
              >
                <FaSearch />
              </button>
              {showSearchBar && (
                <div className="navbar-search-dropdown">
                  <SearchBar />
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <Link to="/wishlist" className="navbar-icon-link" title="Wishlist" onClick={(e) => {
                e.preventDefault();
                handleNavClick('/wishlist');
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              <Link to="/chats" className="navbar-icon-link" title="Messages" onClick={(e) => {
                e.preventDefault();
                handleNavClick('/chats');
              }}>
                <FaComments />
              </Link>

              <NotificationsDropdown />

              <div className="profile-section" ref={dropdownRef}>
                <button 
                  className="profile-button"
                  onClick={() => handleNavClick('/profile')}
                >
                  <img 
                    src={user.profileImage 
                      ? getProfileImageUrl(user.profileImage)
                      : defaultAvatar} 
                    alt="Profile" 
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                      if (user.profileImage && isGoogleProfileImage(user.profileImage)) {
                        setGoogleImageFailed(true);
                      }
                    }}
                  />
                </button>

                <button 
                  className="profile-dropdown-toggle"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <i className="dropdown-icon">▼</i>
                </button>

                {showDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="user-name">{user.name}</p>
                      <p className="user-role">{user.role}</p>
                    </div>
                    <div className="dropdown-items">
                      <Link to="/profile" onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('/profile');
                      }}>
                        <FaUser className="dropdown-icon" /> My Profile
                      </Link>
                      <Link to="/my-listings" onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('/my-listings');
                      }}>
                        <FaBuilding className="dropdown-icon" /> My Properties
                      </Link>
                      <Link to="/wishlist" onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('/wishlist');
                      }}>
                        <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        My Wishlist
                      </Link>
                      <Link to="/notifications" onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('/notifications');
                      }}>
                        <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                      </Link>
                      <Link to="/chats" onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('/chats');
                      }}>
                        <FaComments className="dropdown-icon" /> Messages
                      </Link>
                      <Link to="/settings" onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('/settings');
                      }}>
                        <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <Link to="/logout" onClick={(e) => {
                        e.preventDefault();
                        logout();
                        navigate('/');
                      }}>
                        <FaSignOutAlt className="dropdown-icon" /> Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {!isAuthPage ? (
                <>
                  <button className="btn btn-login" onClick={() => handleNavClick('/login')}>
                    Login
                  </button>
                  <button className="btn btn-signup" onClick={() => handleNavClick('/register')}>
                    Sign Up
                  </button>
                </>
              ) : (
                <button 
                  className={location.pathname === '/login' ? "btn btn-signup" : "btn btn-login"}
                  onClick={() => handleNavClick(location.pathname === '/login' ? '/register' : '/login')}
                >
                  {location.pathname === '/login' ? 'Sign Up' : 'Login'}
                  <TiLocationArrow className="ml-1 inline" />
                </button>
              )}
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
