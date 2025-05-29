import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from '../../utils/axiosConfig';
import { FaCalendarAlt, FaUsers, FaComment } from 'react-icons/fa';

const BookingForm = ({ property }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    numberOfGuests: 1,
    specialRequests: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData(prev => ({
      ...prev,
      startDate: start,
      endDate: end
    }));
  };

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const days = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24));
    return property.price * days;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/bookings', {
        propertyId: property._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfGuests: formData.numberOfGuests,
        specialRequests: formData.specialRequests
      });

      if (response.data.success) {
        toast.success('Booking request submitted successfully!');
        navigate('/my-bookings');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      <h2>Book This Property</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label>
            <FaCalendarAlt /> Check-in / Check-out Dates
          </label>
          <DatePicker
            selected={formData.startDate}
            onChange={handleDateChange}
            startDate={formData.startDate}
            endDate={formData.endDate}
            selectsRange
            minDate={new Date()}
            className="form-control"
            placeholderText="Select dates"
            required
          />
        </div>

        <div className="form-group">
          <label>
            <FaUsers /> Number of Guests
          </label>
          <input
            type="number"
            name="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={handleChange}
            min="1"
            max="10"
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>
            <FaComment /> Special Requests
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="Any special requests or requirements?"
          />
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <span>Price per night:</span>
            <span>₹{property.price.toLocaleString()}</span>
          </div>
          {formData.startDate && formData.endDate && (
            <>
              <div className="summary-item">
                <span>Number of nights:</span>
                <span>
                  {Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="summary-item total">
                <span>Total amount:</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Book Now'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm; 