import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AllContacts.css';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';

const AllContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/contact');
      if (res.data && res.data.data) {
        setContacts(res.data.data);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to view contacts');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (id) => {
    try {
      setMarking(id);
      const res = await axios.put(`/api/contact/${id}/done`);
      if (res.data && res.data.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isDone: true } : c))
        );
      } else {
        alert('Something went wrong');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert(error.response?.data?.error || 'Error updating contact');
    } finally {
      setMarking(null);
    }
  };

  useEffect(() => {
    // Check if user is admin or seller before fetching contacts
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      fetchContacts();
    } else if (user) {
      alert('You do not have permission to view contacts');
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar />
      <div className="contacts-page">
        <h2>All Contact Submissions</h2>

        <div className="contacts-header">
          <button 
            className="back-btn" 
            onClick={() => navigate('/contact')} 
            title="Back to Contact Page"
          ></button>
          <button className="refresh-btn" onClick={fetchContacts}>
            Refresh
          </button>
        </div>

        <div className="contacts-content">
          {loading ? (
            <p className="no-contacts">Loading...</p>
          ) : contacts.length === 0 ? (
            <p className="no-contacts">No contacts found.</p>
          ) : (
            <div className="contacts-list">
              {contacts.map((contact, index) => (
                <div
                  key={contact._id}
                  className={`contact-card ${contact.isDone ? 'done' : ''}`}
                  style={{"--card-index": index}}
                >
                  <div className="contact-header">
                    <p><strong>Name:</strong> {contact.fullName}</p>
                    <span className="contact-date">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p><strong>Email:</strong> {contact.email}</p>
                  <p><strong>Phone:</strong> {contact.phone}</p>
                  <p><strong>Interest:</strong> {contact.propertyInterest}</p>
                  {contact.budget && <p><strong>Budget:</strong> ₹{contact.budget}</p>}
                  <p><strong>Location:</strong> {contact.preferredLocation}</p>
                  <p><strong>Message:</strong> {contact.message}</p>
                  <p><strong>Status:</strong> <span className={`status-${contact.status}`}>{contact.status}</span></p>
      
                  {!contact.isDone && (
                    <button
                      className="mark-done-btn"
                      onClick={() => handleMarkDone(contact._id)}
                      disabled={marking === contact._id} 
                    >
                      {marking === contact._id ? 'Marking...' : 'Mark as Done'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllContacts;
