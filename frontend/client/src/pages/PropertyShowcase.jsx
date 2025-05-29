import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaShare, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import WishlistButton from '../components/wishlist/WishlistButton';
import ReviewsList from '../components/reviews/ReviewsList';
import ChatButton from '../components/chat/ChatButton';
import '../styles/PropertyShowcase.css';

const PropertyShowcase = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('photos');

 
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/listings/${id}`);
        
        if (response.data.success) {
          const propertyData = response.data.data;
          console.log('Property data:', propertyData);
          setProperty(propertyData);
      
          fetchSimilarProperties(propertyData);
        } else {
          toast.error('Failed to load property details');
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        toast.error('Error loading property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);


  const fetchSimilarProperties = async (currentProperty) => {
    try {
  
      const response = await axiosInstance.get('/listings');
      
      if (response.data.success) {
      
        const similar = response.data.data
          .filter(prop => 
            prop._id !== currentProperty._id && 
            prop.propertyType === currentProperty.propertyType &&
            prop.price >= currentProperty.price * 0.7 && 
            prop.price <= currentProperty.price * 1.3
          )
          .slice(0, 3); 
        
        setSimilarProperties(similar);
      }
    } catch (error) {
      console.error('Error fetching similar properties:', error);
    }
  };


  const nextImage = () => {
    if (property?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
      );
    }
  };


  const formatImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
    
      const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `http://localhost:8000${normalizedPath}`;
    }
  };


  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
    
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };


  if (loading) {
    return (
      <div className="property-showcase-page">
        <Navbar />
        <div className="loader-container">
          <Loader />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-showcase-page">
        <Navbar />
        <div className="property-not-found">
          <h2>Property Not Found</h2>
          <p>The property you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="property-showcase-page">
      <Navbar />
      <div className="property-showcase-container">
        <div className="property-showcase-header">
          <div className="property-showcase-title">
            <h1>{property.title}</h1>
            <p className="property-location">
              <FaMapMarkerAlt /> {property.location.address}, {property.location.city}, {property.location.state} {property.location.pincode}
            </p>
          </div>
          <div className="property-showcase-price">
            <h2>₹{property.price.toLocaleString()}</h2>
            <div className="property-type-badge-container">
              <span className="property-type-badge">{property.propertyType === 'rent' ? 'For Rent' : 'For Sell'}</span>
            </div>
          </div>
        </div>

        <div className="property-showcase-tabs">
          <button 
            className={`tab-button ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            Photos
          </button>
          {property.videos && property.videos.length > 0 && (
            <button 
              className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              Videos
            </button>
          )}
          <button 
            className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
        </div>

        <div className="property-showcase-content">
          {activeTab === 'photos' && (
            <div className="property-gallery">
              <div className="main-image-container">
                {property.images && property.images.length > 0 ? (
                  <>
                    <img 
                      src={formatImageUrl(property.images[currentImageIndex])}
                      alt={`${property.title} - Image ${currentImageIndex + 1}`}
                      className="main-property-image"
                      onError={(e) => {
                        console.error(`Failed to load image:`, property.images[currentImageIndex]);
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e969e945%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e969e945%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.4296875%22%20y%3D%22217.75625%22%3EImage%20Not%20Available%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                      }}
                    />
                    <div className="image-navigation">
                      <button className="nav-button prev" onClick={prevImage}>
                        <FaArrowLeft />
                      </button>
                      <button className="nav-button next" onClick={nextImage}>
                        <FaArrowRight />
                      </button>
                    </div>
                    <div className="image-counter">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                ) : (
                  <div className="no-image-placeholder">
                    <p>No images available</p>
                  </div>
                )}
              </div>
              
              {property.images && property.images.length > 1 && (
                <div className="thumbnail-gallery">
                  {property.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={formatImageUrl(image)} 
                        alt={`Thumbnail ${index + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e969e945%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e969e945%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="property-videos">
              {property.videos && property.videos.length > 0 ? (
                property.videos.map((video, index) => (
                  <div key={index} className="video-container">
                    <video 
                      controls 
                      className="property-video"
                      poster={property.images && property.images.length > 0 ? formatImageUrl(property.images[0]) : ''}
                    >
                      <source src={formatImageUrl(video)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <p className="video-caption">Video Tour {index + 1}</p>
                  </div>
                ))
              ) : (
                <div className="no-videos-message">
                  <p>No videos available for this property</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="property-features">
              <h3>Property Features</h3>
              <div className="features-grid">
                {property.features && property.features.length > 0 ? (
                  property.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))
                ) : (
                  <p>No specific features listed for this property</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="property-details-grid">
          <div className="property-main-details">
            <div className="property-specs">
              <div className="spec-item">
                <FaBed className="spec-icon" />
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
              </div>
              <div className="spec-item">
                <FaBath className="spec-icon" />
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
              </div>
              {property.squareFeet && (
                <div className="spec-item">
                  <FaRulerCombined className="spec-icon" />
                  <span>{property.squareFeet} sq.ft</span>
                </div>
              )}
            </div>

            <div className="property-description">
              <h3>Description</h3>
              <p>
                {showFullDescription 
                  ? property.description 
                  : `${property.description.substring(0, 300)}${property.description.length > 300 ? '...' : ''}`
                }
              </p>
              {property.description.length > 300 && (
                <button 
                  className="read-more-btn"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>

            <div className="property-actions">
              <div className="action-button favorite">
                <WishlistButton listingId={property._id} size="lg" /> Add to Wishlist
              </div>
              <button className="action-button share" onClick={handleShare}>
                <FaShare /> Share Property
              </button>
              {/* Debug owner information */}
              {console.log('Property owner info:', { 
                id: property._id,
                owner: property.owner,
                createdBy: property.createdBy
              })}
              <ChatButton 
                listingId={property._id} 
                ownerId={property.owner || (property.createdBy && property.createdBy._id)} 
                ownerName={property.ownerName || (property.createdBy && property.createdBy.name) || "Owner"} 
              />
            </div>
          </div>

          <div className="property-contact-card">
            <h3>Contact Owner</h3>
            <div className="contact-form">
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter your full name" 
                />
              </div>
              <div className="form-group">
                <label>Your Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Enter your email address" 
                />
              </div>
              <div className="form-group">
                <label>Your Phone</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="Enter your phone number" 
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  placeholder={`I'm interested in this ${property.bedrooms} bedroom property at ${property.location.address}. Please contact me with more information.`}
                ></textarea>
              </div>
              <button className="contact-submit">Send Message</button>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="property-reviews-section">
          <ReviewsList listingId={property._id} sellerId={property.createdBy?._id} />
        </div>

        {similarProperties.length > 0 && (
          <div className="similar-properties">
            <h2>Similar Properties</h2>
            <div className="similar-properties-grid">
              {similarProperties.map(prop => (
                <Link to={`/property/${prop._id}`} key={prop._id} className="similar-property-card">
                  <div className="similar-property-image">
                    <img 
                      src={prop.images && prop.images.length > 0 
                        ? formatImageUrl(prop.images[0])
                        : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e969e945%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A15pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e969e945%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22110.5%22%20y%3D%22107.1%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
                      } 
                      alt={prop.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189e969e945%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A15pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189e969e945%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22110.5%22%20y%3D%22107.1%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                      }}
                    />
                    <div className="similar-property-price">₹{prop.price.toLocaleString()}</div>
                  </div>
                  <div className="similar-property-details">
                    <h3>{prop.title}</h3>
                    <p className="similar-property-location">{prop.location.city}, {prop.location.address}</p>
                    <div className="similar-property-specs">
                      <span>{prop.bedrooms} Beds</span>
                      <span>{prop.bathrooms} Baths</span>
                      {prop.squareFeet && <span>{prop.squareFeet} sq.ft</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyShowcase;