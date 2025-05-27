import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import '../styles/AddListing.css';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { FaCamera, FaVideo, FaTrash, FaEye, FaUpload } from 'react-icons/fa';

const AddListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    propertyType: 'rent',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    features: [],
    images: [],
    videos: []
  });

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
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      features: value.split(',').map(feature => feature.trim())
    }));
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (e.target.name === 'images' && formData.images.length + files.length > 10) {
      toast.warning('You can upload a maximum of 10 images');
      return;
    }
    
    if (e.target.name === 'videos' && formData.videos.length + files.length > 3) {
      toast.warning('You can upload a maximum of 3 videos');
      return;
    }
 
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
      totalSize += files[i].size;
      
  
      const maxSize = e.target.name === 'images' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
      if (files[i].size > maxSize) {
        const sizeLimit = e.target.name === 'images' ? '10MB' : '100MB';
        toast.error(`File "${files[i].name}" exceeds the maximum size of ${sizeLimit}`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append(e.target.name, files[i]);
    }

 
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 500);
    
    try {
      console.log('Uploading files:', e.target.name, files.length);
      console.log(`Using upload endpoint for ${e.target.name}`);
      
    
      const response = await axios.post('/listings/upload-media', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted > 95 ? 95 : percentCompleted);
        }
      });
      
      console.log('Upload response:', response.data);
      
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      
      setTimeout(() => {
        setIsUploading(false);
        
 
        if (e.target.name === 'images') {
          let imageUrls = [];
      
          if (response.data.data && response.data.data.images) {
            imageUrls = response.data.data.images;
          } else {
            console.error('Unexpected response format for images:', response.data);
            toast.warning('Received unexpected response format from server');
            return;
          }
             console.log('Original image URLs from server:', imageUrls);
          console.log('Window location origin:', window.location.origin);
          
          const absoluteUrls = imageUrls.map(path => {
            let finalUrl;
            if (path.startsWith('http')) {
              finalUrl = path;
            } else {
           
              const backendUrl = 'http://localhost:8000';
          
              const normalizedPath = path.startsWith('/') ? path : `/${path}`;
              finalUrl = `${backendUrl}${normalizedPath}`;
            }
            console.log(`Converting ${path} to ${finalUrl}`);
            
       
            const img = new Image();
            img.src = finalUrl;
            img.onerror = () => {
              console.error(`Image URL verification failed: ${finalUrl}`);
            };
            img.onload = () => {
              console.log(`Image URL verification successful: ${finalUrl}`);
            };
            
            return finalUrl;
          });
          
          console.log('Final processed image URLs:', absoluteUrls);
          
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...absoluteUrls]
          }));
          
          toast.success(`${absoluteUrls.length} image(s) uploaded successfully`);
        } else {
      
          let videoUrls = [];
          
    
          if (response.data.data && response.data.data.videos) {
            videoUrls = response.data.data.videos;
          } else {
            console.error('Unexpected response format for videos:', response.data);
            toast.warning('Received unexpected response format from server');
            return;
          }

          console.log('Original video URLs from server:', videoUrls);
          
          const absoluteUrls = videoUrls.map(path => {
            let finalUrl;
            if (path.startsWith('http')) {
              finalUrl = path;
            } else {
              
              const backendUrl = 'http://localhost:8000';
             
              const normalizedPath = path.startsWith('/') ? path : `/${path}`;
              finalUrl = `${backendUrl}${normalizedPath}`;
            }
            console.log(`Converting ${path} to ${finalUrl}`);
            return finalUrl;
          });
          
          console.log('Processed video URLs:', absoluteUrls);
          
          setFormData(prev => ({
            ...prev,
            videos: [...prev.videos, ...absoluteUrls]
          }));
          
          toast.success(`${absoluteUrls.length} video(s) uploaded successfully`);
        }
      }, 500);
    } catch (error) {
      
      clearInterval(progressInterval);
      
      
      setIsUploading(false);
      setUploadProgress(0);
      
      console.error('Upload error:', error);
      
      
      if (error.response && error.response.status === 404) {
        toast.error('Upload endpoint not found. Please check server configuration.');
        console.error('API endpoint not found. Check your server routes and make sure they match the client requests.');
      } else {
        toast.error(error.response?.data?.message || 'Error uploading files. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isUploading) {
      toast.warning('Please wait for file uploads to complete');
      return;
    }
    
    
    if (!formData.title || !formData.description || !formData.price || 
        !formData.location.address || !formData.location.city || 
        !formData.bedrooms || !formData.bathrooms) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);

    try {
      
      const submissionData = {
        ...formData,
        images: formData.images.map(img => {
          
          const backendUrl = 'http://localhost:8000';
          if (img.startsWith(backendUrl)) {
            return img.replace(backendUrl, '');
          }
          return img;
        }),
        videos: formData.videos.map(vid => {
          
          const backendUrl = 'http://localhost:8000';
          if (vid.startsWith(backendUrl)) {
            return vid.replace(backendUrl, '');
          }
          return vid;
        })
      };
      
      await axios.post('/listings', submissionData);
      toast.success('Listing created successfully');
      navigate('/my-listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error.response?.data?.message || 'Error creating listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <>
        <Navbar />
        <div className="add-listing-container">
          <div className="add-listing-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
            <div className="add-listing-form" style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem' }}>
              <h1 style={{ color: '#dc3545', fontSize: '1.5rem', marginBottom: '1rem' }}>Access Denied</h1>
              <p style={{ marginBottom: '1.5rem' }}>Only sellers and admins can create listings.</p>
              <button 
                onClick={() => navigate('/')} 
                className="btn btn-primary"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="add-listing-container">
        <div className="add-listing-header">
          <div>
            <h1>Add New Property Listing</h1>
            <p>Create a new property listing to showcase your property</p>
          </div>
        </div>
        
        <div className="add-listing-content">
          <form onSubmit={handleSubmit} className="add-listing-form">
            <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter property title"
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter price"
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
                className="form-control"
                placeholder="Property size in square feet"
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
                placeholder="Postal code"
              />
            </div>

            <div className="form-group form-grid-full">
              <label>Features (comma separated)</label>
              <input
                type="text"
                name="features"
                onChange={handleFeatureChange}
                placeholder="e.g., Swimming Pool, Garden, Garage"
                className="form-control"
              />
            </div>

            <div className="form-group form-grid-full">
              <label>
                Images (up to 10)
                {formData.images.length > 0 && (
                  <span className="file-count">{formData.images.length}/10</span>
                )}
              </label>
              <div 
                className={`file-input-container image-upload ${isDraggingImage ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingImage(true);
                }}
                onDragLeave={() => setIsDraggingImage(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingImage(false);
                  if (!isUploading && e.dataTransfer.files.length > 0) {
                    const event = { target: { files: e.dataTransfer.files, name: 'images' } };
                    handleFileChange(event);
                  }
                }}
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
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="preview-image"
                        onLoad={() => console.log(`Image ${index + 1} loaded successfully:`, image)}
                        onError={(e) => {
                          console.error(`Failed to load image ${index + 1}:`, image);
                          
                          const backendUrl = 'http://localhost:8000';
                          const imagePath = image.replace(backendUrl, '');
                          const alternativeUrl = `${backendUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
                          
                          console.log(`Trying alternative URL: ${alternativeUrl}`);
                          
                          
                          if (alternativeUrl !== image) {
                            e.target.src = alternativeUrl;
                          } else {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/150x150/gray/white?text=Image+Error';
                            toast.error(`Failed to load image ${index + 1}`);
                          }
                        }}
                      />
                      <div className="preview-overlay">
                        Property Image {index + 1}
                      </div>
                      <div className="preview-actions">
                        <button 
                          type="button" 
                          className="preview-action-btn"
                          onClick={() => window.open(image, '_blank')}
                        >
                          <FaEye />
                        </button>
                        <button 
                          type="button" 
                          className="preview-action-btn delete"
                          onClick={() => {
                            const newImages = [...formData.images];
                            newImages.splice(index, 1);
                            setFormData({...formData, images: newImages});
                            toast.success('Image removed');
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.images.length === 0 && (
                <div style={{textAlign: 'center', padding: '2rem 0', color: '#777'}}>
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
                className={`file-input-container video-upload ${isDraggingVideo ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingVideo(true);
                }}
                onDragLeave={() => setIsDraggingVideo(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingVideo(false);
                  if (!isUploading && e.dataTransfer.files.length > 0) {
                    const event = { target: { files: e.dataTransfer.files, name: 'videos' } };
                    handleFileChange(event);
                  }
                }}
              >
                <FaVideo className="file-input-icon" />
                <input
                  type="file"
                  name="videos"
                  multiple
                  accept="video/*"
                  onChange={handleFileChange}
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
                          onClick={() => {
                            const newVideos = [...formData.videos];
                            newVideos.splice(index, 1);
                            setFormData({...formData, videos: newVideos});
                            toast.success('Video removed');
                          }}
                        >
                          <FaTrash />
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
                <strong>Tips:</strong> Keep videos under 100MB for faster uploads. Short, well-lit videos showing key areas of the property work best.
              </div>
            </div>
          </div>

            <div className="form-group form-grid-full">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddListing;
