import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Logout.css";
import api from '../axiosConfig'; // Your configured axios instance

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Optional: Send logout request to backend
        await api.post('/auth/logout');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        // Clear client-side authentication
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        navigate('/login', { replace: true });
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className="logout-container">
      <h2>Logging out...</h2>
      <p>Please wait while we securely sign you out</p>
    </div>
  );
};

export default Logout;
