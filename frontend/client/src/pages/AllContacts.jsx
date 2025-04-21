import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import this
import '../styles/AllContacts.css';

const AllContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const navigate = useNavigate(); 


  const fetchContacts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/contact');
      const data = await res.json();
      if (res.ok) {
        setContacts(data || []);
      } else {
        console.error('Failed to fetch contacts:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false); 
    }
  };


  const handleMarkDone = async (id) => {
    try {
      setMarking(id); 
      const res = await fetch(`http://localhost:8000/api/contact/${id}/done`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isDone: true } : c)) 
        );
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      alert('Error updating contact');
    } finally {
      setMarking(null); 
    }
  };


  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="contacts-page">
      <h2>All Contact Submissions</h2>


      <button className="back-btn" onClick={() => navigate('/contact')}>
        ⬅ Back to Contact Page
      </button>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : contacts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No contacts found.</p>
      ) : (
        <div className="contacts-list">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className={`contact-card ${contact.isDone ? 'done' : ''}`}
            >
              <p><strong>Name:</strong> {contact.fullName}</p>
              <p><strong>Email:</strong> {contact.email}</p>
              <p><strong>Phone:</strong> {contact.phone}</p>
              <p><strong>Message:</strong> {contact.message}</p>

  
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
  );
};

export default AllContacts;
