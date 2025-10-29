import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFilter, FaSort, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import SearchBar from '../components/common/SearchBar';
import AdvancedSearch from '../components/properties/AdvancedSearch';
import { getListings } from '../api/listingsApi';
import { API_URL } from '../config';
import { toast } from 'react-toastify';
import '../styles/theme.css';
import '../styles/PropertiesPage.css';
import '../styles/animations.css';
import '../styles/effects.css';

const PropertiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  const [filters, setFilters] = React.useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [activePropertyType, setActivePropertyType] = React.useState('all');
  const [activeTags, setActiveTags] = React.useState([]);
  const [error, setError] = React.useState(null);

  const propertyTypes = [
    { id: 'all', label: 'All Properties' },
    { id: 'rent', label: 'For Rent' },
    { id: 'sale', label: 'For Sale' }
  ];

  const buildingTypes = [
    { id: 'apartment', label: 'Apartment' },
    { id: 'house', label: 'House' },
    { id: 'villa', label: 'Villa' },
    { id: 'penthouse', label: 'Penthouse' },
    { id: 'townhouse', label: 'Townhouse' },
    { id: 'land', label: 'Land' },
    { id: 'commercial', label: 'Commercial' }
  ];

  const popularLocations = [
    { id: 'mumbai', label: 'Mumbai' },
    { id: 'delhi', label: 'Delhi' },
    { id: 'bangalore', label: 'Bangalore' },
    { id: 'hyderabad', label: 'Hyderabad' },
    { id: 'chennai', label: 'Chennai' },
    { id: 'pune', label: 'Pune' },
    { id: 'kolkata', label: 'Kolkata' },
    { id: 'ahmedabad', label: 'Ahmedabad' }
  ];

  const fetchProperties = async (currentFilters, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilters = { 
        ...currentFilters,
        page,
        limit: 10,
        _t: Date.now() // Prevent caching
      };

      console.log('Fetching properties with filters:', apiFilters);
      const response = await getListings(page, apiFilters);
      
      console.log('Raw API Response:', response);
      
      // Handle canceled requests
      if (response?.message === 'Request was canceled') {
        console.log('Request was canceled, skipping state updates');
        return;
      }
      
      if (!response || !response.success) {
        console.error('API Error Response:', response);
        throw new Error(response?.message || 'Failed to fetch properties');
      }
      
      // Check if response.data exists and is an array
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid listings data:', response.data);
        throw new Error('Invalid response format: listings data is not an array');
      }
      
      console.log('Raw listings data:', response.data);
      
      // Filter properties based on status only
      const availableProperties = response.data.filter(property => 
        property.status === 'available' || property.status === 'token_booked'
      );
      
      console.log('Available properties:', availableProperties);
      
      setProperties(availableProperties);
      setPagination({
        total: response.pagination?.total || availableProperties.length,
        page: response.pagination?.page || page,
        limit: response.pagination?.limit || 10,
        pages: response.pagination?.pages || Math.ceil((response.pagination?.total || availableProperties.length) / 10)
      });
      
      console.log('Updated pagination state:', {
        total: response.pagination?.total || availableProperties.length,
        page: response.pagination?.page || page,
        limit: response.pagination?.limit || 10,
        pages: response.pagination?.pages || Math.ceil((response.pagination?.total || availableProperties.length) / 10)
      });
      
    } catch (error) {
      // Don't show error for canceled requests
      if (error.message === 'Request was canceled') {
        console.log('Request was canceled, skipping error state');
        return;
      }
      
      console.error('Error fetching properties:', error);
      setError(error.message || 'Failed to fetch properties');
      setProperties([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        pages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const newFilters = {};
    
    for (const [key, value] of queryParams.entries()) {
      newFilters[key] = value;
    }
    
    if (newFilters.propertyType) {
      setActivePropertyType(newFilters.propertyType);
    } else {
      setActivePropertyType('all');
    }
    
    const tags = [];
    if (newFilters.city) tags.push({ type: 'city', value: newFilters.city });
    if (newFilters.state) tags.push({ type: 'state', value: newFilters.state });
    if (newFilters.buildingType) tags.push({ type: 'buildingType', value: newFilters.buildingType });
    
    setActiveTags(tags);
    const page = newFilters.page ? parseInt(newFilters.page) : 1;
    setFilters(newFilters);
    fetchProperties(newFilters, page);

    return () => {
      // Cleanup function
    };
  }, [location.search]);

  const handlePropertyTypeChange = (type) => {
    const newFilters = { ...filters };
    
    if (type === 'all') {
      delete newFilters.propertyType;
    } else {
      newFilters.propertyType = type;
    }
    
    // Reset to first page when changing filters
    newFilters.page = 1;
    
    navigate({
      pathname: location.pathname,
      search: new URLSearchParams(newFilters).toString()
    });
  };

  const handleTagSelect = (tag) => {
    const newFilters = { ...filters };
    
    if (tag.type === 'city') {
      newFilters.city = tag.value;
    } else if (tag.type === 'state') {
      newFilters.state = tag.value;
    } else if (tag.type === 'buildingType') {
      newFilters.buildingType = tag.value;
    }
    
    // Reset to first page when changing filters
    newFilters.page = 1;
    
    navigate({
      pathname: location.pathname,
      search: new URLSearchParams(newFilters).toString()
    });
  };

  const handleTagRemove = (tagToRemove) => {
    const newFilters = { ...filters };
    
    if (tagToRemove.type === 'city') {
      delete newFilters.city;
    } else if (tagToRemove.type === 'state') {
      delete newFilters.state;
    } else if (tagToRemove.type === 'buildingType') {
      delete newFilters.buildingType;
    }
    
    // Reset to first page when changing filters
    newFilters.page = 1;
    
    navigate({
      pathname: location.pathname,
      search: new URLSearchParams(newFilters).toString()
    });
  };

  const handleAdvancedSearch = (advancedFilters) => {
    const newFilters = { ...filters, ...advancedFilters };
    
    // Reset to first page when changing filters
    newFilters.page = 1;
    
    navigate({
      pathname: location.pathname,
      search: new URLSearchParams(newFilters).toString()
    });
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    
    navigate({
      pathname: location.pathname,
      search: new URLSearchParams(newFilters).toString()
    });
  };

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return '/default-property.png';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      
      const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_URL}${normalizedPath}`;
    }
  };

  const navigateToProperty = (id) => {
    navigate(`/properties/${id}`);
  };

  return (
    <div className="properties-page">
      <Navbar />
      
      <div className="properties-container">
        <div className="search-section fade-in">
          <h1 className="float">Find Your Dream Property</h1>
          <SearchBar />
          
          <div className="filter-tabs">
            <div className="property-type-tabs">
              {propertyTypes.map(type => (
                <button
                  key={type.id}
                  className={`property-type-tab ${activePropertyType === type.id ? 'active' : ''}`}
                  onClick={() => handlePropertyTypeChange(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            <div className="filter-actions">
              <button
                className={`advanced-filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <FaFilter /> {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
              </button>
            </div>
          </div>
          
          {showAdvancedFilters && (
            <div className="advanced-filters-container">
              <AdvancedSearch 
                onSearch={handleAdvancedSearch} 
                initialFilters={filters}
              />
            </div>
          )}
          
          {/* Active tags */}
          {activeTags.length > 0 && (
            <div className="active-tags">
              <span className="active-tags-label">Active Filters:</span>
              {activeTags.map((tag, index) => (
                <div key={index} className="active-tag">
                  <span className="tag-label">
                    {tag.type === 'city' ? 'City:' : 
                     tag.type === 'state' ? 'State:' : 
                     tag.type === 'buildingType' ? 'Type:' : ''}
                  </span>
                  <span className="tag-value">{tag.value}</span>
                  <button 
                    className="remove-tag"
                    onClick={() => handleTagRemove(tag)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                className="clear-all-tags"
                onClick={() => navigate('/properties')}
              >
                Clear All
              </button>
            </div>
          )}
          
          {/* Popular location tags */}
          <div className="popular-locations">
            <span className="popular-locations-label">Popular Locations:</span>
            <div className="location-tags">
              {popularLocations.map(location => (
                <button
                  key={location.id}
                  className="location-tag"
                  onClick={() => handleTagSelect({ type: 'city', value: location.label })}
                >
                  <FaMapMarkerAlt /> {location.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="properties-results">
          <div className="results-header">
            <div className="results-count">
              {pagination.total} {pagination.total === 1 ? 'Property' : 'Properties'} Found
            </div>
            
            <div className="results-sort">
              <label htmlFor="sort-select">
                <FaSort /> Sort by:
              </label>
              <select
                id="sort-select"
                value={filters.sort || 'newest'}
                onChange={(e) => {
                  const newFilters = { ...filters, sort: e.target.value };
                  delete newFilters.page;
                  navigate({
                    pathname: location.pathname,
                    search: new URLSearchParams(newFilters).toString()
                  });
                }}
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : error ? (
            <div className="error-container">
              <h3>Error Loading Properties</h3>
              <p>{error}</p>
              <button onClick={() => fetchProperties(filters, pagination.page)}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              {Array.isArray(properties) && properties.length > 0 ? (
                <div className="properties-grid">
                  {properties.map((property, index) => (
                    <div 
                      key={property._id || index} 
                      className={`property-card fade-in shine stagger-${(index % 5) + 1}`}
                      onClick={() => navigateToProperty(property._id)}
                    >
                      <div className="property-image">
                        <img 
                          src={property.images && property.images.length > 0 
                            ? formatImageUrl(property.images[0]) 
                            : '/default-property.png'
                          } 
                          alt={property.title || 'Property'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-property.png';
                          }}
                        />
                        <div className="property-badge">
                          {property.propertyType === 'rent' ? 'For Rent' : 'For Sale'}
                        </div>
                      </div>
                      
                      <div className="property-details">
                        <h3 className="property-title">{property.title || 'Untitled Property'}</h3>
                        <p className="property-location">
                          <FaMapMarkerAlt /> {property.location?.city || 'Unknown'}, {property.location?.state || 'Unknown'}
                        </p>
                        <p className="property-price pulse">
                          ₹{property.price?.toLocaleString() || '0'}{property.propertyType === 'rent' ? '/month' : ''}
                        </p>
                        
                        <div className="property-features">
                          <div className="feature">
                            <FaBed /> {property.bedrooms || 0} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                          </div>
                          <div className="feature">
                            <FaBath /> {property.bathrooms || 0} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                          </div>
                          {property.squareFeet && (
                            <div className="feature">
                              <FaRulerCombined /> {property.squareFeet} sq.ft
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-properties animated-bg">
                  <h3 className="gradient-text">No Properties Found</h3>
                  <p>Try adjusting your search filters or explore our popular locations to find your dream property.</p>
                </div>
              )}
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-button"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(page => {
                    
                      return (
                        page === 1 ||
                        page === pagination.pages ||
                        Math.abs(page - pagination.page) <= 1
                      );
                    })
                    .map((page, index, array) => {
                  
                      const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                      const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && <span className="pagination-ellipsis">...</span>}
                          <button
                            className={`pagination-button ${pagination.page === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                          {showEllipsisAfter && <span className="pagination-ellipsis">...</span>}
                        </React.Fragment>
                      );
                    })}
                  
                  <button
                    className="pagination-button"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;