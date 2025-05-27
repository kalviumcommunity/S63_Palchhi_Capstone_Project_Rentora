import jwt_decode from 'jwt-decode';

const useUserRole = () => {
  const token = localStorage.getItem('token'); 

  if (!token) return null; 

  try {
    const decoded = jwt_decode(token); 
    return decoded?.role || null; 
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

export default useUserRole;
