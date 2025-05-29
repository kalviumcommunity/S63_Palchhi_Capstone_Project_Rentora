import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { getListings } from '../../api/listingsApi';
import '../../styles/SearchBar.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState([]);
  const searchRef = React.useRef(null);
  const navigate = useNavigate();

 
  const popularTags = [
    { type: 'city', name: 'Mumbai' },
    { type: 'city', name: 'Delhi' },
    { type: 'city', name: 'Bangalore' },
    { type: 'city', name: 'Hyderabad' },
    { type: 'city', name: 'Chennai' },
    { type: 'state', name: 'Maharashtra' },
    { type: 'state', name: 'Karnataka' },
    { type: 'propertyType', name: 'Apartment' },
    { type: 'propertyType', name: 'Villa' },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 2) {
      setIsSearching(true);
      setShowResults(true);
      performSearch(value);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };


  const performSearch = async (query) => {
    try {
    
      const filters = {
        search: query,
        limit: 5
      };
      
      
      selectedTags.forEach(tag => {
        if (tag.type === 'city') {
          filters.city = tag.name;
        } else if (tag.type === 'state') {
          filters.state = tag.name;
        } else if (tag.type === 'propertyType') {
          filters.buildingType = tag.name.toLowerCase();
        }
      });
      
      const response = await getListings(filters);
      
      if (response.success) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim() || selectedTags.length > 0) {

      const queryParams = new URLSearchParams();
      
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }
      
      selectedTags.forEach(tag => {
        if (tag.type === 'city') {
          queryParams.append('city', tag.name);
        } else if (tag.type === 'state') {
          queryParams.append('state', tag.name);
        } else if (tag.type === 'propertyType') {
          queryParams.append('buildingType', tag.name.toLowerCase());
        }
      });
      
      navigate(`/properties?${queryParams.toString()}`);
      setShowResults(false);
    }
  };

 
  const handleResultClick = (id) => {
    navigate(`/property/${id}`);
    setShowResults(false);
    setSearchTerm('');
  };

  const addTag = (tag) => {
   
    if (!selectedTags.some(t => t.type === tag.type && t.name === tag.name)) {
      setSelectedTags([...selectedTags, tag]);
      performSearch(searchTerm);
    }
  };

  
  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(
      tag => !(tag.type === tagToRemove.type && tag.name === tagToRemove.name)
    ));
    performSearch(searchTerm);
  };


  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedTags([]);
  };

  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for properties, locations, etc."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchTerm.length > 2 || selectedTags.length > 0) {
                setShowResults(true);
              }
            }}
            className="search-input"
          />
          {(searchTerm || selectedTags.length > 0) && (
            <button 
              type="button" 
              className="clear-search-btn"
              onClick={clearSearch}
            >
              <FaTimes />
            </button>
          )}
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </div>
        
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="selected-tags">
            {selectedTags.map((tag, index) => (
              <div key={index} className="selected-tag">
                <span className="tag-icon">
                  {tag.type === 'city' || tag.type === 'state' ? <FaMapMarkerAlt /> : <FaTag />}
                </span>
                <span className="tag-name">{tag.name}</span>
                <button 
                  type="button" 
                  className="remove-tag-btn"
                  onClick={() => removeTag(tag)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
      
      {/* Search results dropdown */}
      {showResults && (
        <div className="search-results-dropdown">
          {isSearching ? (
            <div className="searching-indicator">Searching...</div>
          ) : (
            <>
              {Array.isArray(searchResults) && searchResults.length > 0 ? (
                <div className="search-results-list">
                  {searchResults.map(property => (
                    <div 
                      key={property?._id || Math.random()} 
                      className="search-result-item"
                      onClick={() => property?._id && handleResultClick(property._id)}
                    >
                      <div className="result-image">
                        {property?.images && Array.isArray(property.images) && property.images.length > 0 ? (
                          <img 
                            src={property.images[0]?.includes('http') 
                              ? property.images[0] 
                              : `http://localhost:8000${property.images[0]}`} 
                            alt={property?.title || 'Property'}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-property.png';
                            }}
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </div>
                      <div className="result-details">
                        <h4>{property?.title || 'Untitled Property'}</h4>
                        <p className="result-location">
                          <FaMapMarkerAlt /> {property?.location?.city || 'N/A'}, {property?.location?.state || 'N/A'}
                        </p>
                        <p className="result-price">₹{property?.price?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  ))}
                  <div className="view-all-results">
                    <button 
                      onClick={handleSearchSubmit}
                      className="view-all-btn"
                    >
                      View all results
                    </button>
                  </div>
                </div>
              ) : (
                searchTerm && searchTerm.length > 2 ? (
                  <div className="no-results">
                    <p>No properties found matching "{searchTerm}"</p>
                    <div className="suggested-tags">
                      <p>Try searching by popular locations:</p>
                      <div className="tag-suggestions">
                        {popularTags.slice(0, 5).map((tag, index) => (
                          <button 
                            key={index} 
                            className="tag-suggestion"
                            onClick={() => addTag(tag)}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="popular-searches">
                    <p>Popular searches:</p>
                    <div className="popular-tags">
                      {popularTags.map((tag, index) => (
                        <button 
                          key={index} 
                          className="popular-tag"
                          onClick={() => addTag(tag)}
                        >
                          {tag.type === 'city' || tag.type === 'state' ? (
                            <FaMapMarkerAlt className="tag-icon" />
                          ) : (
                            <FaTag className="tag-icon" />
                          )}
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;