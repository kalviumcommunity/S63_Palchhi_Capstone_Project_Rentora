import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { FaCamera, FaVideo, FaTrash } from 'react-icons/fa';

const PropertyListingForm = ({ listing }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: 'rent',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    features: [],
    images: [],
    videos: []
  });

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        propertyType: listing.propertyType || 'rent',
        bedrooms: listing.bedrooms || '',
        bathrooms: listing.bathrooms || '',
        squareFeet: listing.squareFeet || '',
        location: {
          address: listing.location?.address || '',
          city: listing.location?.city || '',
          state: listing.location?.state || '',
          pincode: listing.location?.pincode || ''
        },
        features: listing.features || [],
        images: listing.images || [],
        videos: listing.videos || []
      });
    }
  }, [listing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFeatureChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      features: checked
        ? [...prev.features, value]
        : prev.features.filter(feature => feature !== value)
    }));
  };

  const handleFileChange = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append(type, file);
    });

    try {
      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          [type]: [...prev[type], ...response.data.files]
        }));
        toast.success('Files uploaded successfully');
      } else {
        toast.error(response.data.message || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    }
  };

  const handleRemoveFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined
      };

      const response = await axiosInstance.put(`/listings/${listing._id}`, listingData);

      if (response.data.success) {
        toast.success('Listing updated successfully');
        navigate('/my-listings');
      } else {
        toast.error(response.data.message || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error(error.response?.data?.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  const commonFeatures = [
    'Air Conditioning',
    'Heating',
    'Balcony',
    'Pool',
    'Gym',
    'Parking',
    'Elevator',
    'Security',
    'Furnished',
    'Pet Friendly',
    'Wifi',
    'Laundry',
    'Dishwasher',
    'Garden',
    'Terrace'
  ];

  return (
    <form onSubmit={handleSubmit} className="property-form">
      <div className="form-grid">
        <div className="form-group form-grid-full">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Property title"
          />
        </div>

        <div className="form-group">
          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            className="form-control"
            placeholder="Property price"
          />
        </div>

        <div className="form-group">
          <label>Property Type</label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>
        </div>

        <div className="form-group">
          <label>Bedrooms</label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            required
            min="0"
            className="form-control"
            placeholder="Number of bedrooms"
          />
        </div>

        <div className="form-group">
          <label>Bathrooms</label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            required
            min="0"
            className="form-control"
            placeholder="Number of bathrooms"
          />
        </div>

        <div className="form-group">
          <label>Square Feet</label>
          <input
            type="number"
            name="squareFeet"
            value={formData.squareFeet}
            onChange={handleChange}
            min="0"
            className="form-control"
            placeholder="Property size in sq.ft"
          />
        </div>

        <div className="form-group form-grid-full">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="form-control"
            placeholder="Detailed description of the property"
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Street address"
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="City name"
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            name="location.state"
            value={formData.location.state}
            onChange={handleChange}
            className="form-control"
            placeholder="State name"
          />
        </div>

        <div className="form-group">
          <label>Pincode</label>
          <input
            type="text"
            name="location.pincode"
            value={formData.location.pincode}
            onChange={handleChange}
            className="form-control"
            placeholder="Pincode"
          />
        </div>

        <div className="form-group form-grid-full">
          <label>Features</label>
          <div className="features-grid">
            {commonFeatures.map(feature => (
              <div key={feature} className="feature-checkbox">
                <input
                  type="checkbox"
                  id={`feature-${feature}`}
                  name={feature}
                  value={feature}
                  checked={formData.features.includes(feature)}
                  onChange={handleFeatureChange}
                />
                <label htmlFor={`feature-${feature}`}>{feature}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group form-grid-full">
          <label>Images</label>
          <div className="file-upload-container">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'images')}
              className="file-input"
            />
            <div className="file-upload-label">
              <FaCamera className="upload-icon" />
              <span>Upload Images</span>
            </div>
          </div>
          {formData.images.length > 0 && (
            <div className="image-preview-grid">
              {formData.images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={image} alt={`Property ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => handleRemoveFile('images', index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group form-grid-full">
          <label>Videos</label>
          <div className="file-upload-container">
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleFileChange(e, 'videos')}
              className="file-input"
            />
            <div className="file-upload-label">
              <FaVideo className="upload-icon" />
              <span>Upload Videos</span>
            </div>
          </div>
          {formData.videos.length > 0 && (
            <div className="video-preview-grid">
              {formData.videos.map((video, index) => (
                <div key={index} className="video-preview">
                  <video src={video} controls />
                  <button
                    type="button"
                    className="remove-video"
                    onClick={() => handleRemoveFile('videos', index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/my-listings')}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PropertyListingForm; 