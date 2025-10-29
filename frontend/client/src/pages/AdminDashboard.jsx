import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FaUsers, FaHome, FaChartBar, FaComments, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosConfig';
import { API_URL } from '../config';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  
  if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
    return <Navigate to="/" />;
  }

  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/admin/stats');
        
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Failed to load dashboard statistics');
        }
      } catch (err) {
        setError('Error loading dashboard data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchStats();
    }
  }, [isAuthenticated, user]);


  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== 'users') return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/auth/users', {
          params: {
            page: currentPage,
            limit: 10,
            search: searchTerm,
            status: filterStatus !== 'all' ? filterStatus : undefined
          }
        });
        
        if (response.data.success) {
          setUsers(response.data.data);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError('Failed to load users');
        }
      } catch (err) {
        setError('Error loading users: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab, currentPage, searchTerm, filterStatus, isAuthenticated, user]);

  
  useEffect(() => {
    const fetchListings = async () => {
      if (activeTab !== 'listings') return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/admin/listings', {
          params: {
            page: currentPage,
            limit: 10,
            search: searchTerm,
            status: filterStatus !== 'all' ? filterStatus : undefined
          }
        });
        
        if (response.data.success) {
          setListings(response.data.data);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError('Failed to load listings');
        }
      } catch (err) {
        setError('Error loading listings: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchListings();
    }
  }, [activeTab, currentPage, searchTerm, filterStatus, isAuthenticated, user]);

  
  useEffect(() => {
    const fetchReports = async () => {
      if (activeTab !== 'reports') return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/admin/reports', {
          params: {
            page: currentPage,
            limit: 10,
            status: filterStatus !== 'all' ? filterStatus : undefined
          }
        });
        
        if (response.data.success) {
          setReports(response.data.data);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError('Failed to load reports');
        }
      } catch (err) {
        setError('Error loading reports: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchReports();
    }
  }, [activeTab, currentPage, filterStatus, isAuthenticated, user]);

  
  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/api/admin/users/${userId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: newStatus } : user
        ));
      } else {
        alert('Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Error updating user status: ' + (err.message || 'Unknown error'));
    }
  };


  const handleListingStatusChange = async (listingId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/api/admin/listings/${listingId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
    
        setListings(listings.map(listing => 
          listing._id === listingId ? { ...listing, status: newStatus } : listing
        ));
      } else {
        alert('Failed to update listing status');
      }
    } catch (err) {
      console.error('Error updating listing status:', err);
      alert('Error updating listing status: ' + (err.message || 'Unknown error'));
    }
  };

  
  const handleReportResolution = async (reportId, resolution) => {
    try {
      const response = await axiosInstance.put(`/api/admin/reports/${reportId}/resolve`, {
        resolution
      });
      
      if (response.data.success) {

        setReports(reports.map(report => 
          report._id === reportId ? { ...report, status: 'resolved', resolution } : report
        ));
      } else {
        alert('Failed to resolve report');
      }
    } catch (err) {
      console.error('Error resolving report:', err);
      alert('Error resolving report: ' + (err.message || 'Unknown error'));
    }
  };

  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
  };


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading) {
    return (
      <div className="admin-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar />
      
      <div className="admin-container">
        <div className="admin-sidebar">
          <h2>Admin Dashboard</h2>
          
          <nav className="admin-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartBar /> Overview
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('users');
                setCurrentPage(1);
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <FaUsers /> Users
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('listings');
                setCurrentPage(1);
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <FaHome /> Listings
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('reports');
                setCurrentPage(1);
                setFilterStatus('all');
              }}
            >
              <FaExclamationTriangle /> Reports
            </button>
          </nav>
        </div>
        
        <div className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <Loader />
            </div>
          ) : error ? (
            <div className="admin-error">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && stats && (
                <div className="admin-overview">
                  <h1>Dashboard Overview</h1>
                  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon users">
                        <FaUsers />
                      </div>
                      <div className="stat-content">
                        <h3>Total Users</h3>
                        <p className="stat-value">{stats.totalUsers}</p>
                        <p className="stat-detail">
                          <span className="highlight">+{stats.newUsersToday}</span> today
                        </p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon listings">
                        <FaHome />
                      </div>
                      <div className="stat-content">
                        <h3>Total Listings</h3>
                        <p className="stat-value">{stats.totalListings}</p>
                        <p className="stat-detail">
                          <span className="highlight">+{stats.newListingsToday}</span> today
                        </p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon messages">
                        <FaComments />
                      </div>
                      <div className="stat-content">
                        <h3>Total Messages</h3>
                        <p className="stat-value">{stats.totalMessages}</p>
                        <p className="stat-detail">
                          <span className="highlight">+{stats.newMessagesToday}</span> today
                        </p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon reports">
                        <FaExclamationTriangle />
                      </div>
                      <div className="stat-content">
                        <h3>Open Reports</h3>
                        <p className="stat-value">{stats.openReports}</p>
                        <p className="stat-detail">
                          <span className={stats.openReportsChange > 0 ? 'negative' : 'positive'}>
                            {stats.openReportsChange > 0 ? '+' : ''}
                            {stats.openReportsChange}
                          </span> since yesterday
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overview-charts">
                    <div className="chart-container">
                      <h3>Recent Activity</h3>
                      <div className="activity-list">
                        {stats.recentActivity.map((activity, index) => (
                          <div key={index} className="activity-item">
                            <div className={`activity-icon ${activity.type}`}>
                              {activity.type === 'user' && <FaUsers />}
                              {activity.type === 'listing' && <FaHome />}
                              {activity.type === 'report' && <FaExclamationTriangle />}
                            </div>
                            <div className="activity-details">
                              <p className="activity-text">{activity.description}</p>
                              <p className="activity-time">{formatDate(activity.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="chart-container">
                      <h3>System Status</h3>
                      <div className="status-list">
                        <div className="status-item">
                          <div className="status-label">Server Status</div>
                          <div className={`status-value ${stats.systemStatus.server === 'Operational' ? 'operational' : 'issue'}`}>
                            {stats.systemStatus.server}
                          </div>
                        </div>
                        
                        <div className="status-item">
                          <div className="status-label">Database Status</div>
                          <div className={`status-value ${stats.systemStatus.database === 'Operational' ? 'operational' : 'issue'}`}>
                            {stats.systemStatus.database}
                          </div>
                        </div>
                        
                        <div className="status-item">
                          <div className="status-label">API Response Time</div>
                          <div className="status-value">
                            {stats.systemStatus.apiResponseTime} ms
                          </div>
                        </div>
                        
                        <div className="status-item">
                          <div className="status-label">Server Uptime</div>
                          <div className="status-value">
                            {stats.systemStatus.uptime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="admin-users">
                  <h1>User Management</h1>
                  
                  <div className="admin-controls">
                    <form className="admin-search" onSubmit={handleSearch}>
                      <input
                        type="text"
                        placeholder="Search users by name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button type="submit">Search</button>
                    </form>
                    
                    <div className="admin-filter">
                      <label>Status:</label>
                      <select 
                        value={filterStatus} 
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="unverified">Unverified</option>
                      </select>
                    </div>
                  </div>
                  
                  {users.length > 0 ? (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user._id}>
                              <td>
                                <div className="user-name-cell">
                                  <img 
                                    src={user.avatar || '/default-avatar.png'} 
                                    alt={user.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/default-avatar.png';
                                    }}
                                  />
                                  <span>{user.name}</span>
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td>
                                <span className={`role-badge ${user.role}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td>
                                <span className={`status-badge ${user.status}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td>{formatDate(user.createdAt)}</td>
                              <td>
                                <div className="action-buttons">
                                  {user.status === 'active' ? (
                                    <button 
                                      className="suspend-button"
                                      onClick={() => handleUserStatusChange(user._id, 'suspended')}
                                    >
                                      Suspend
                                    </button>
                                  ) : (
                                    <button 
                                      className="activate-button"
                                      onClick={() => handleUserStatusChange(user._id, 'active')}
                                    >
                                      Activate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-results">
                      <p>No users found</p>
                    </div>
                  )}
                  
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      
                      <span className="page-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Listings Tab */}
              {activeTab === 'listings' && (
                <div className="admin-listings">
                  <h1>Listing Management</h1>
                  
                  <div className="admin-controls">
                    <form className="admin-search" onSubmit={handleSearch}>
                      <input
                        type="text"
                        placeholder="Search listings by title or location"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button type="submit">Search</button>
                    </form>
                    
                    <div className="admin-filter">
                      <label>Status:</label>
                      <select 
                        value={filterStatus} 
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  
                  {listings.length > 0 ? (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Listing</th>
                            <th>Owner</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listings.map(listing => (
                            <tr key={listing._id}>
                              <td>
                                <div className="listing-cell">
                                  <img 
                                    src={listing.images && listing.images.length > 0 
                      ? `${API_URL}${listing.images[0]}` 
                                      : '/default-property.png'
                                    } 
                                    alt={listing.title}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/default-property.png';
                                    }}
                                  />
                                  <div>
                                    <span className="listing-title">{listing.title}</span>
                                    <span className="listing-location">
                                      {listing.location.city}, {listing.location.state}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>{listing.ownerName}</td>
                              <td>
                                <span className={`type-badge ${listing.propertyType}`}>
                                  {listing.propertyType === 'rent' ? 'For Rent' : 'For Sale'}
                                </span>
                              </td>
                              <td>₹{listing.price.toLocaleString()}</td>
                              <td>
                                <span className={`status-badge ${listing.status}`}>
                                  {listing.status}
                                </span>
                              </td>
                              <td>{formatDate(listing.createdAt)}</td>
                              <td>
                                <div className="action-buttons">
                                  {listing.status === 'active' ? (
                                    <button 
                                      className="suspend-button"
                                      onClick={() => handleListingStatusChange(listing._id, 'suspended')}
                                    >
                                      Suspend
                                    </button>
                                  ) : (
                                    <button 
                                      className="activate-button"
                                      onClick={() => handleListingStatusChange(listing._id, 'active')}
                                    >
                                      Activate
                                    </button>
                                  )}
                                  <a 
                                    href={`/property/${listing._id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="view-button"
                                  >
                                    View
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-results">
                      <p>No listings found</p>
                    </div>
                  )}
                  
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      
                      <span className="page-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="admin-reports">
                  <h1>Report Management</h1>
                  
                  <div className="admin-controls">
                    <div className="admin-filter">
                      <label>Status:</label>
                      <select 
                        value={filterStatus} 
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  
                  {reports.length > 0 ? (
                    <div className="reports-list">
                      {reports.map(report => (
                        <div key={report._id} className={`report-card ${report.status}`}>
                          <div className="report-header">
                            <h3>{report.type} Report</h3>
                            <span className={`status-badge ${report.status}`}>
                              {report.status}
                            </span>
                          </div>
                          
                          <div className="report-content">
                            <p className="report-reason">
                              <strong>Reason:</strong> {report.reason}
                            </p>
                            <p className="report-description">
                              <strong>Description:</strong> {report.description}
                            </p>
                            
                            <div className="report-details">
                              <div className="report-detail">
                                <strong>Reported By:</strong> {report.reporterName}
                              </div>
                              <div className="report-detail">
                                <strong>Reported Item:</strong> {report.itemType}
                              </div>
                              <div className="report-detail">
                                <strong>Date Reported:</strong> {formatDate(report.createdAt)}
                              </div>
                            </div>
                            
                            {report.status === 'resolved' && (
                              <div className="resolution-details">
                                <p><strong>Resolution:</strong> {report.resolution}</p>
                                <p><strong>Resolved On:</strong> {formatDate(report.resolvedAt)}</p>
                              </div>
                            )}
                          </div>
                          
                          {report.status === 'pending' && (
                            <div className="report-actions">
                              <button 
                                className="resolve-button accept"
                                onClick={() => handleReportResolution(report._id, 'Report accepted and action taken')}
                              >
                                <FaCheck /> Accept Report
                              </button>
                              <button 
                                className="resolve-button reject"
                                onClick={() => handleReportResolution(report._id, 'Report rejected - no violation found')}
                              >
                                Reject Report
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-results">
                      <p>No reports found</p>
                    </div>
                  )}
                  
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      
                      <span className="page-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;