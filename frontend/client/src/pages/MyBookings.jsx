import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosConfig';
import { FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axiosInstance.get('/api/bookings/my-bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingBooking(bookingId);
      const response = await axiosInstance.post(`/api/bookings/${bookingId}/cancel`, {
        cancellationReason: 'Cancelled by user'
      });

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingBooking(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'confirmed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
      case 'completed':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loader-container">
          <Loader />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <h1>My Bookings</h1>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <h3>No bookings found</h3>
            <p>Start exploring properties to make your first booking!</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/properties')}
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-image">
                  <img 
                    src={booking.property.images[0] || '/placeholder-property.jpg'} 
                    alt={booking.property.title}
                  />
                  <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="booking-details">
                  <h3>{booking.property.title}</h3>
                  <p className="location">
                    <FaMapMarkerAlt /> {booking.property.location.city}, {booking.property.location.state}
                  </p>

                  <div className="booking-dates">
                    <div className="date-item">
                      <FaCalendarAlt />
                      <div>
                        <span>Check-in</span>
                        <strong>{formatDate(booking.startDate)}</strong>
                      </div>
                    </div>
                    <div className="date-item">
                      <FaCalendarAlt />
                      <div>
                        <span>Check-out</span>
                        <strong>{formatDate(booking.endDate)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="booking-summary">
                    <div className="summary-item">
                      <span>Total Amount:</span>
                      <span className="amount">
                        <FaMoneyBillWave /> ₹{booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span>Guests:</span>
                      <span>{booking.numberOfGuests}</span>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="special-requests">
                      <h4>Special Requests:</h4>
                      <p>{booking.specialRequests}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <button
                      className="btn btn-danger btn-block"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingBooking === booking._id}
                    >
                      {cancellingBooking === booking._id ? (
                        'Cancelling...'
                      ) : (
                        <>
                          <FaTimes /> Cancel Booking
                        </>
                      )}
                    </button>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => navigate(`/property/${booking.property._id}`)}
                    >
                      View Property
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings; 