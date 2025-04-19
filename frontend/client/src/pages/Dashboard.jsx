// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Welcome to Your Dashboard</h1>
      <nav>
        <Link to="/logout">Sign Out</Link>
      </nav>
    </div>
  );
};

export default Dashboard;
