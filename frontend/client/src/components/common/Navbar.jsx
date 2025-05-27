import * as React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { TiLocationArrow } from "react-icons/ti";
import { pageTransition } from "../../utils/pageTransitions";

import "../../styles/Navbar.css";
import "../../styles/SearchBar.css";
import "../../styles/animations.css";
import logo from "../../../public/rentora-logo.png";
import defaultAvatar from "../../../public/default-avatar.png";
import NotificationsDropdown from "../notifications/NotificationsDropdown";
import SearchBar from "./SearchBar";
import { getUnreadCount } from "../../api/notificationApi";
import { isGoogleProfileImage, getSafeProfileImageUrl } from "../../utils/imageUtils";
import { FaSearch, FaComments } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  

  let user = null;
  let logout = () => {
    console.log('Logout function not available');
    navigate('/login');
  };
  
  try {
    const auth = useAuth();
    user = auth.user;
    logout = auth.logout;
  } catch {
    console.log('Auth context not available in this component');
  }
  
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showSearchBar, setShowSearchBar] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const navContainerRef = React.useRef(null);

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

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
  

  const [googleImageFailed, setGoogleImageFailed] = React.useState(false);
  
  React.useEffect(() => {
    console.log("Navbar user state updated:", user ? user.name : "No user");
    
  
    setGoogleImageFailed(false);
    
  
    if (user && user.profileImage) {
      if (isGoogleProfileImage(user.profileImage)) {
        console.log("Google profile image detected - skipping preload to avoid rate limits");
      } else {
        console.log("Preloading non-Google profile image");
        const img = new Image();
        img.src = user.profileImage.includes('http') 
          ? user.profileImage
          : `http://localhost:8000${user.profileImage}`;
        img.onload = () => console.log("Profile image loaded successfully in navbar");
        img.onerror = () => console.log("Profile image preload failed, will use fallback if needed");
      }
    }
  }, [user]);
  
 
  const fetchUnreadCount = async (forceRefresh = false) => {
    if (!user) return;
    
    try {
      
      await getUnreadCount(forceRefresh);
    } catch (error) {
      console.error('Failed to fetch unread count in Navbar:', error);
    }
  };
  
  React.useEffect(() => {
    if (!user) return;
    
  
    const initialFetchTimer = setTimeout(() => {
      fetchUnreadCount(false); 
    }, 8000); 
    

    const intervalId = setInterval(() => {
      fetchUnreadCount(false); 
    }, 300000); 
    

    return () => {
      clearInterval(intervalId);
      clearTimeout(initialFetchTimer);
    };
  }, [user]);
  

  React.useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log('Received profile update event in Navbar:', event.detail);
    
      setShowDropdown(false); 
    };
    
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('user-profile-updated', handleProfileUpdate);
  }, []);

 
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

  React.useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  const handleNavClick = async (path, isHash = false) => {
    if (isHash) {
  
      const element = document.querySelector(`#${path.toLowerCase()}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
   
      if (path === '/login' || path === '/signup' || path === '/register') {
       
        navigate(path);
      } else {
    
        pageTransition.navigate(navigate, path);
      }
    }
  };

 
  const isPropertiesPage = location.pathname === '/properties';

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/signup';

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <nav className="navbar">
        <div className="navbar-left">
          <div className="nav-item">
            <Link to="/" onClick={(e) => { 
              e.preventDefault(); 
              
              if (isAuthPage) {
                navigate('/');
              } else {
                pageTransition.navigate(navigate, '/');
              }
            }}>HOME</Link>
            <div className="dropdown-menu">
              <Link to="/about" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/about');
              }}>About Us</Link>
              <Link to="/contact" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/contact');
              }}>Contact</Link>
              <Link to="/faq" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/faq');
              }}>FAQ</Link>
            </div>
          </div>
          
          {user && (
            <div className="nav-item">
              <Link to="/my-listings" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/my-listings');
              }}>MY PROPERTIES</Link>
              <div className="dropdown-menu">
                <Link to="/my-listings" onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavClick('/my-listings');
                }}>All My Properties</Link>
                <Link to="/my-listings?status=active" onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavClick('/my-listings?status=active');
                }}>Active Listings</Link>
                <Link to="/my-listings?status=pending" onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavClick('/my-listings?status=pending');
                }}>Pending Listings</Link>
                <Link to="/wishlist" onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavClick('/wishlist');
                }}>Favorite Properties</Link>
                <Link to="/add-property" onClick={(e) => { 
                  e.preventDefault(); 
                  handleNavClick('/add-property');
                }}>Add New Property</Link>
              </div>
            </div>
          )}
          
          <div className="nav-item">
            <Link to="/properties?propertyType=rent" onClick={(e) => { 
              e.preventDefault(); 
              handleNavClick('/properties?propertyType=rent');
            }}>RENT</Link>
            <div className="dropdown-menu">
              <Link to="/properties?propertyType=rent&category=apartment" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/properties?propertyType=rent&category=apartment');
              }}>Apartments</Link>
              <Link to="/properties?propertyType=rent&category=house" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/properties?propertyType=rent&category=house');
              }}>Houses</Link>
              <Link to="/properties?propertyType=rent&category=villa" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/properties?propertyType=rent&category=villa');
              }}>Villas</Link>
              <Link to="/properties?propertyType=rent&category=commercial" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/properties?propertyType=rent&category=commercial');
              }}>Commercial</Link>
            </div>
          </div>
          
          <div className="nav-item">
            <Link to="/properties?propertyType=sale" onClick={(e) => { 
              e.preventDefault(); 
              handleNavClick('/properties?propertyType=sale');
            }}>BUY</Link>
            <div className="dropdown-menu">
              <Link to="/properties?propertyType=sale&category=apartment" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/properties?propertyType=sale&category=apartment');
              }}>Apartments</Link>
              <Link to="/properties?propertyType=sale&category=house" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/properties?propertyType=sale&category=house');
              }}>Houses</Link>
              <Link to="/properties?propertyType=sale&category=villa" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/properties?propertyType=sale&category=villa');
              }}>Villas</Link>
              <Link to="/properties?propertyType=sale&category=land" onClick={(e) => { 
                e.preventDefault(); 
                handleNavClick('/properties?propertyType=sale&category=land');
              }}>Land</Link>
            </div>
          </div>
        </div>
        
        <div className="navbar-center">
          <img src={logo} alt="Rentora Trusted Homes" className="navbar-logo" />
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
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
                  {/* Skip Google image if it previously failed */}
                  {user.profileImage && isGoogleProfileImage(user.profileImage) && googleImageFailed ? (
                    <img 
                      src={defaultAvatar} 
                      alt="Profile" 
                      className="profile-avatar"
                      key="nav-profile-fallback"
                    />
                  ) : (
                    <img 
                      src={user.profileImage 
                        ? getSafeProfileImageUrl(
                            user.profileImage.includes('http') 
                              ? user.profileImage
                              : `http://localhost:8000${user.profileImage}`,
                            defaultAvatar
                          )
                        : defaultAvatar} 
                      alt="Profile" 
                      className="profile-avatar"
                      key="nav-profile-img"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.log("Using default avatar due to image load failure");
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                        
                        // Mark Google images as failed to avoid future attempts
                        if (user.profileImage && isGoogleProfileImage(user.profileImage)) {
                          console.log("Google image failed to load - using fallback for future renders");
                          setGoogleImageFailed(true);
                        }
                      }}
                    />
                  )}
                </button>
                <button 
                  className="profile-dropdown-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
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
                        setShowDropdown(false);
                        handleNavClick('/profile');
                      }}>
                        My Profile
                      </Link>
                      <Link to="/my-listings" onClick={(e) => { 
                        e.preventDefault(); 
                        setShowDropdown(false);
                        handleNavClick('/my-listings');
                      }}>
                        My Properties
                      </Link>
                      <Link to="/wishlist" onClick={(e) => { 
                        e.preventDefault(); 
                        setShowDropdown(false);
                        handleNavClick('/wishlist');
                      }}>
                        My Wishlist
                      </Link>
                      <Link to="/notifications" onClick={(e) => { 
                        e.preventDefault(); 
                        setShowDropdown(false);
                        handleNavClick('/notifications');
                      }}>
                        Notifications
                      </Link>
                      <Link to="/chats" onClick={(e) => { 
                        e.preventDefault(); 
                        setShowDropdown(false);
                        handleNavClick('/chats');
                      }}>
                        Messages
                      </Link>
                      <Link to="/settings" onClick={(e) => { 
                        e.preventDefault(); 
                        setShowDropdown(false);
                        handleNavClick('/settings');
                      }}>
                        Settings
                      </Link>
                      <Link to="/logout" onClick={(e) => { 
                        e.preventDefault(); 
                        setShowDropdown(false);
                        logout();
                        navigate('/');
                      }}>
                        Logout
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
                  <button className="btn btn-login" onClick={() => navigate('/login')}>
                    Login
                  </button>
                  <Link to="/register">
                    <button className="btn btn-signup">Sign Up</button>
                  </Link>
                </>
              ) : (
                <Link 
                  to={location.pathname === '/login' ? '/register' : '/login'} 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    navigate(location.pathname === '/login' ? '/register' : '/login'); 
                  }}
                >
                  <button className={location.pathname === '/login' ? "btn btn-signup" : "btn btn-login"}>
                    {location.pathname === '/login' ? 'Sign Up' : 'Login'}
                    <TiLocationArrow className="ml-1 inline" />
                  </button>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
