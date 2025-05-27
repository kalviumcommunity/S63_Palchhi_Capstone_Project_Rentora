import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Logout.css";
import api from '../axiosConfig'; 

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
      
        await api.post('/auth/logout');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
    
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
    
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
