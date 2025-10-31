import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCamera, FaVideo } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import axiosInstance from '../utils/axiosConfig';
import { API_URL } from '../config';
import { toast } from 'react-toastify';
import '../styles/MyListings.css';

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    'location.address': '',
    'location.city': '',
    'location.state': '',
    'location.zipCode': '',
    amenities: [],
    images: [],
    videos: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  // Helper to safely extract the first image URL from a listing
  const getFirstImageUrl = (listing) => {
    try {
      if (!listing) return '/default-property.png';
      const imgs = listing.images;
      if (!imgs || !Array.isArray(imgs) || imgs.length === 0) return '/default-property.png';

      const first = imgs[0];

      // If it's already a string, normalize it
      if (typeof first === 'string') {
        if (first.startsWith('http')) return first;
        const normalizedPath = first.startsWith('/') ? first : `/${first}`;
        return `${API_URL}${normalizedPath}`;
      }

      // If it's an object (e.g., { secure_url }), try known keys
      if (typeof first === 'object' && first !== null) {
        if (first.secure_url) return first.secure_url;
        if (first.url) return first.url;
        // fallback to string coercion
        const str = String(first);
        if (str && str !== '[object Object]') return str;
      }

      return '/default-property.png';
    } catch (err) {
      console.error('Error resolving listing image URL', err, listing && listing.images);
      return '/default-property.png';
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get('/my-listings');
        
        if (response.data.success) {
          setListings(response.data.data);
        } else {
          toast.error('Failed to load listings');
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Error loading listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);


  const handleEditListing = (listing) => {
    
        const processedImages = listing.images ? listing.images.map(img => {
      if (img.startsWith('http')) {
        return img;
      } else {
       
        const normalizedPath = img.startsWith('/') ? img : `/${img}`;
        return `${API_URL}${normalizedPath}`;
      }
    }) : [];

 
        const processedVideos = listing.videos ? listing.videos.map(video => {
      if (video.startsWith('http')) {
        return video;
      } else {
       
        const normalizedPath = video.startsWith('/') ? video : `/${video}`;
        return `${API_URL}${normalizedPath}`;
      }
    }) : [];


    setFormData({
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price || '',
      propertyType: listing.propertyType || '',
      bedrooms: listing.bedrooms || '',
      bathrooms: listing.bathrooms || '',
      squareFeet: listing.squareFeet || '',
      'location.address': listing.location?.address || '',
      'location.city': listing.location?.city || '',
      'location.state': listing.location?.state || '',
      'location.zipCode': listing.location?.pincode || '',
      amenities: listing.features || [],
      images: processedImages || [],
      videos: processedVideos || []
    });

    setEditingListing(listing);
    setShowEditOverlay(true);
  };

  
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/listings/${listingId}`);
      
      if (response.data.success) {
        toast.success('Listing deleted successfully');
        setListings(listings.filter(listing => listing._id !== listingId));
      } else {
        toast.error(response.data.message || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in again to delete this listing');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized to delete this listing');
      } else if (error.response?.status === 404) {
        toast.error('Listing not found');
      } else {
        toast.error('Error deleting listing. Please try again.');
      }
    }
  };

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
  
      if (checked) {
        setFormData(prev => ({
          ...prev,
          amenities: [...prev.amenities, name]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          amenities: prev.amenities.filter(item => item !== name)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await axiosInstance.post('/listings/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
      
        let imageUrls = response.data.data.images;
        
      
        const absoluteUrls = imageUrls.map(path => {
          let finalUrl;
          if (path.startsWith('http')) {
            finalUrl = path;
          } else {
          
            const backendUrl = API_URL;
            
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            finalUrl = `${backendUrl}${normalizedPath}`;
            
      
            console.log(`Normalized image URL: ${finalUrl} from original path: ${path}`);
          }
          return finalUrl;
        });
        
  
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...absoluteUrls]
        }));
        
        toast.success(`${absoluteUrls.length} image(s) uploaded successfully`);
      } else {
        toast.error('Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('videos', file);
      });

      const response = await axiosInstance.post('/listings/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
      
        let videoUrls = response.data.data.videos;
        
  
        const absoluteUrls = videoUrls.map(path => {
          let finalUrl;
          if (path.startsWith('http')) {
            finalUrl = path;
          } else {
          
            const backendUrl = API_URL;

            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            finalUrl = `${backendUrl}${normalizedPath}`;
            
  
            console.log(`Normalized video URL: ${finalUrl} from original path: ${path}`);
          }
          return finalUrl;
        });
        
        setFormData(prev => ({
          ...prev,
          videos: [...prev.videos, ...absoluteUrls]
        }));
        
        toast.success(`${absoluteUrls.length} video(s) uploaded successfully`);
      } else {
        toast.error('Failed to upload videos');
      }
    } catch (error) {
      console.error('Error uploading videos:', error);
      toast.error('Error uploading videos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleDragLeave = () => {
    setIsDraggingImage(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please drop image files only');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await axiosInstance.post('/listings/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
  
        let imageUrls = response.data.data.images;
        
        
        const absoluteUrls = imageUrls.map(path => {
          let finalUrl;
          if (path.startsWith('http')) {
            finalUrl = path;
          } else {
            
            const backendUrl = API_URL;
          
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            finalUrl = `${backendUrl}${normalizedPath}`;
            
            
            console.log(`Normalized drag-drop image URL: ${finalUrl} from original path: ${path}`);
          }
          return finalUrl;
        });
        
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...absoluteUrls]
        }));
        
        toast.success(`${absoluteUrls.length} image(s) uploaded successfully`);
      } else {
        toast.error('Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  const handleRemoveVideo = (index) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingListing) return;
    
    setIsSubmitting(true);
    
    try {
      
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        propertyType: formData.propertyType,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
        location: {
          address: formData['location.address'],
          city: formData['location.city'],
          state: formData['location.state'],
          pincode: formData['location.zipCode']
        },
        features: formData.amenities,
        images: formData.images,
        videos: formData.videos
      };
      
      const response = await axiosInstance.put(`/listings/${editingListing._id}`, listingData);
      
      if (response.data.success) {
        toast.success('Listing updated successfully');
        
      
        setListings(prev => 
          prev.map(listing => 
            listing._id === editingListing._id ? response.data.data : listing
          )
        );
        
      
        setShowEditOverlay(false);
        setEditingListing(null);
      } else {
        toast.error(response.data.message || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Error updating listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const propertyTypes = [
    'rent', 'sale'
  ];

  const commonAmenities = [
    'Air Conditioning', 'Heating', 'Balcony', 'Pool', 'Gym', 
    'Parking', 'Elevator', 'Security', 'Furnished', 'Pet Friendly',
    'Wifi', 'Laundry', 'Dishwasher', 'Garden', 'Terrace'
  ];

  return (
    <>
      <Navbar />
      <div className="my-listings-container">
        <div className="my-listings-header">
          <h1>My Properties</h1>
          <button 
            className="btn btn-primary add-listing-btn"
            onClick={() => navigate('/add-listing')}
          >
            <FaPlus /> Add New Listing
          </button>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader />
          </div>
        ) : listings.length > 0 ? (
          <div className="listings-grid">
            {listings.map((listing) => (
              <div 
                key={listing._id} 
                className="listing-item"
                onClick={() => navigate(`/properties/${listing._id}`)}
              >
                <div className="listing-image-container">
                  <img
                    src={getFirstImageUrl(listing)}
                    alt={listing.title}
                    className="listing-image"
                    onError={(e) => {
                      const imgs = listing && listing.images;
                      console.error(`Failed to load image for listing ${listing._id}:`, imgs ? imgs[0] : undefined);
                      e.target.onerror = null;

                      // Try a filename-based fallback if possible
                      if (imgs && Array.isArray(imgs) && imgs[0]) {
                        const first = imgs[0];
                        let filename;
                        if (typeof first === 'string') {
                          const imagePath = first;
                          filename = imagePath.split('/').pop();
                        } else if (typeof first === 'object' && first !== null) {
                          filename = (first.secure_url || first.url || '').split('/').pop();
                        }

                        if (filename) {
                          const alt = `${API_URL}/uploads/images/${filename}`;
                          console.log(`Trying alternative URL: ${alt}`);
                          e.target.src = alt;
                          return;
                        }
                      }

                      e.target.src = '/default-property.png';
                    }}
                  />
                  <div className="listing-price">₹{listing.price.toLocaleString()}</div>
                  <div className="listing-type">{listing.propertyType === 'rent' ? 'For Rent' : 'For Sale'}</div>
                  <div className="view-details-badge">View Details</div>
                </div>
                <div className="listing-details">
                  <h3 className="listing-title">{listing.title}</h3>
                  <p className="listing-location">
                    {listing.location.city}, {listing.location.address}
                  </p>
                  <div className="listing-meta">
                    <span>{listing.bedrooms} Beds</span>
                    <span>{listing.bathrooms} Baths</span>
                    {listing.squareFeet && (
                      <span>{listing.squareFeet} sq.ft</span>
                    )}
                  </div>
                  <div className="listing-actions">
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditListing(listing);
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDeleteListing(listing._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-listings">
            <p>You haven't created any listings yet.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/add-listing')}
            >
              Create Your First Listing
            </button>
          </div>
        )}

        {/* Edit Overlay */}
        {showEditOverlay && editingListing && (
          <div className="edit-overlay">
            <div className="edit-overlay-content">
              <div className="edit-overlay-header">
                <h2>Edit Listing</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowEditOverlay(false);
                    setEditingListing(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="edit-form">
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
                      <option value="">Select property type</option>
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
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
                      value={formData['location.address']}
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
                      value={formData['location.city']}
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
                      value={formData['location.state']}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="State name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="location.zipCode"
                      value={formData['location.zipCode']}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Pincode"
                    />
                  </div>

                  <div className="form-group form-grid-full">
                    <label>Features</label>
                    <div className="amenities-grid">
                      {commonAmenities.map(amenity => (
                        <div key={amenity} className="amenity-checkbox">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity}`}
                            name={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onChange={handleChange}
                          />
                          <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group form-grid-full">
                    <label>
                      Images
                      {formData.images.length > 0 && (
                        <span className="file-count">{formData.images.length}/10</span>
                      )}
                    </label>
                    <div 
                      className="file-drop-area"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <FaCamera className="file-input-icon" />
                      <input
                        type="file"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                        disabled={isUploading}
                      />
                      <span className="file-type-indicator">JPG, PNG, WEBP</span>
                      <span className="file-input-text">
                        {isUploading 
                          ? `Uploading images... ${Math.round(uploadProgress)}%` 
                          : isDraggingImage
                            ? 'Drop images here to upload!'
                            : 'Drag and drop your property images here, or click to browse'}
                      </span>
                      
                      {isUploading && (
                        <div className="upload-progress">
                          <div 
                            className="upload-progress-bar" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    
                    {formData.images.length > 0 && (
                      <div className="image-preview">
                        {formData.images.map((image, index) => (
                          <div key={index} className="preview-container">
                            <img
                              src={image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20150%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e969e945%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A12pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e969e945%22%3E%3Crect%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2240%22%20y%3D%2280%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'}
                              alt={`Property ${index + 1}`}
                              className="preview-image"
                              onLoad={() => console.log(`Image ${index + 1} loaded successfully:`, image)}
                              onError={(e) => {
                                console.error(`Failed to load image ${index + 1}:`, image || 'undefined');
                                
                              
                                if (image && typeof image === 'string' && image.includes(API_URL)) {
                                  const backendUrl = API_URL;
                                  const imagePath = image.replace(backendUrl, '');
                                  const alternativeUrl = `${backendUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
                                  
                                  console.log(`Trying alternative URL: ${alternativeUrl}`);
                                  
                                  
                                  if (alternativeUrl !== image) {
                                    e.target.src = alternativeUrl;
                                    return;
                                  }
                                  
                                
                                  if (imagePath && typeof imagePath === 'string') {
                                    const filename = imagePath.split('/').pop();
                                    if (filename) {
                                      const secondAlternative = `${backendUrl}/uploads/images/${filename}`;
                                      
                                      if (secondAlternative !== image && secondAlternative !== alternativeUrl) {
                                        console.log(`Trying second alternative URL: ${secondAlternative}`);
                                        e.target.src = secondAlternative;
                                        return;
                                      }
                                    }
                                  }
                                }
                                
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22150%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20150%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e969e945%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A12pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e969e945%22%3E%3Crect%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2240%22%20y%3D%2280%22%3EImage%20Error%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                              }}
                            />
                            <div className="preview-overlay">
                              Property Image {index + 1}
                            </div>
                            <div className="preview-actions">
                              <button 
                                type="button" 
                                className="preview-action-btn delete"
                                onClick={() => handleRemoveImage(index)}
                                title="Delete image"
                                aria-label="Delete image"
                              >
                                <FaTrash size={16} />
                                <span className="delete-text">Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.images.length === 0 && (
                      <div style={{textAlign: 'center', padding: '1rem 0', color: '#777'}}>
                        No images uploaded yet. Add some photos to showcase your property!
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group form-grid-full">
                    <label>
                      Videos (up to 3)
                      {formData.videos.length > 0 && (
                        <span className="file-count">{formData.videos.length}/3</span>
                      )}
                    </label>
                    <div 
                      className="file-drop-area video-upload"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingVideo(true);
                      }}
                      onDragLeave={() => setIsDraggingVideo(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingVideo(false);
                        if (!isUploading && e.dataTransfer.files.length > 0) {
                          
                          const videoFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('video/'));
                          if (videoFiles.length === 0) {
                            toast.error('Please drop video files only');
                            return;
                          }
                          
                          const event = { target: { files: videoFiles, name: 'videos' } };
                          handleVideoUpload(event);
                        }
                      }}
                    >
                      <FaVideo className="file-input-icon" />
                      <input
                        type="file"
                        name="videos"
                        multiple
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="file-input"
                        disabled={isUploading}
                      />
                      <span className="file-type-indicator">MP4, MOV, AVI</span>
                      <span className="file-input-text">
                        {isUploading 
                          ? `Uploading videos... ${Math.round(uploadProgress)}%` 
                          : isDraggingVideo
                            ? 'Drop videos here to upload!'
                            : 'Upload videos to give a virtual tour of your property'}
                      </span>
                      
                      {isUploading && (
                        <div className="upload-progress">
                          <div 
                            className="upload-progress-bar" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    
                    {formData.videos.length > 0 && (
                      <div className="video-preview">
                        {formData.videos.map((video, index) => (
                          <div key={index} className="video-item">
                            <div className="video-icon">
                              <FaVideo />
                            </div>
                            <div className="video-details">
                              <div className="video-name">Property Video {index + 1}</div>
                              <div className="video-size">Video uploaded successfully</div>
                            </div>
                            <div className="video-actions">
                              <button 
                                type="button" 
                                className="preview-action-btn delete"
                                onClick={() => handleRemoveVideo(index)}
                                title="Delete video"
                                aria-label="Delete video"
                              >
                                <FaTrash size={16} />
                                <span className="delete-text">Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.videos.length === 0 && (
                      <div style={{textAlign: 'center', padding: '1rem 0', color: '#777'}}>
                        No videos uploaded yet. Videos can help potential buyers/renters get a better feel for the property.
                      </div>
                    )}
                    
                    <div className="upload-tips" style={{marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
                      <strong>Tips:</strong> Keep videos under 50MB for faster uploads. Short, well-lit videos showing key areas of the property work best.
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditOverlay(false);
                      setEditingListing(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyListings;