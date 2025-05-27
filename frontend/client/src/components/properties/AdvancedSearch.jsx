import * as React from 'react';
import '../../styles/AdvancedSearch.css';

const AdvancedSearch = ({ onSearch, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    city: initialFilters.city || '',
    state: initialFilters.state || '',
    propertyType: initialFilters.propertyType || '',
    buildingType: initialFilters.buildingType || '',
    bedrooms: initialFilters.bedrooms || '',
    bathrooms: initialFilters.bathrooms || '',
    minSquareFeet: initialFilters.minSquareFeet || '',
    maxSquareFeet: initialFilters.maxSquareFeet || '',
    furnished: initialFilters.furnished === 'true',
    airConditioning: initialFilters.airConditioning === 'true',
    parking: initialFilters.parking === 'true',
    gym: initialFilters.gym === 'true',
    swimmingPool: initialFilters.swimmingPool === 'true',
    internet: initialFilters.internet === 'true',
    petFriendly: initialFilters.petFriendly === 'true',
    garden: initialFilters.garden === 'true',
    security: initialFilters.security === 'true',
    balcony: initialFilters.balcony === 'true',
    elevator: initialFilters.elevator === 'true',
    wheelchairAccess: initialFilters.wheelchairAccess === 'true',
    sort: initialFilters.sort || 'newest'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    

    const apiFilters = { ...filters };
    Object.keys(apiFilters).forEach(key => {
      if (typeof apiFilters[key] === 'boolean') {
        apiFilters[key] = apiFilters[key] ? 'true' : undefined;
      } else if (apiFilters[key] === '') {
        apiFilters[key] = undefined;
      }
    });
    
    onSearch(apiFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      minPrice: '',
      maxPrice: '',
      city: '',
      state: '',
      propertyType: '',
      buildingType: '',
      bedrooms: '',
      bathrooms: '',
      minSquareFeet: '',
      maxSquareFeet: '',
      furnished: false,
      airConditioning: false,
      parking: false,
      gym: false,
      swimmingPool: false,
      internet: false,
      petFriendly: false,
      garden: false,
      security: false,
      balcony: false,
      elevator: false,
      wheelchairAccess: false,
      sort: 'newest'
    };
    
    setFilters(resetFilters);
    onSearch({});
  };

  return (
    <div className="advanced-search">
      <div className="advanced-search-header">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="advanced-search-toggle"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          {isOpen ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>
        
        <div className="sort-container">
          <label htmlFor="sort" className="sort-label">Sort by:</label>
          <select
            id="sort"
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="advanced-search-form">
          <div className="form-grid">
            {/* Price Range */}
            <div className="form-section">
              <h3 className="section-title">Price Range</h3>
              <div className="input-group">
                <div className="input-container">
                  <label htmlFor="minPrice" className="input-label">
                    Min Price
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleChange}
                    className="text-input"
                    placeholder="₹"
                  />
                </div>
                <div className="input-container">
                  <label htmlFor="maxPrice" className="input-label">
                    Max Price
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    className="text-input"
                    placeholder="₹"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-section">
              <h3 className="section-title">Location</h3>
              <div className="input-container">
                <label htmlFor="city" className="input-label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  className="text-input"
                  placeholder="Enter city"
                />
              </div>
              <div className="input-container" style={{marginTop: '10px'}}>
                <label htmlFor="state" className="input-label">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={filters.state}
                  onChange={handleChange}
                  className="text-input"
                  placeholder="Enter state"
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="form-section">
              <h3 className="section-title">Property Type</h3>
              <div className="input-container">
                <label htmlFor="propertyType" className="input-label">
                  For Rent/Sale
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleChange}
                  className="select-input"
                >
                  <option value="">All</option>
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>
              <div className="input-container" style={{marginTop: '10px'}}>
                <label htmlFor="buildingType" className="input-label">
                  Building Type
                </label>
                <select
                  id="buildingType"
                  name="buildingType"
                  value={filters.buildingType}
                  onChange={handleChange}
                  className="select-input"
                >
                  <option value="">All</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="form-section">
              <h3 className="section-title">Rooms</h3>
              <div className="input-group">
                <div className="input-container">
                  <label htmlFor="bedrooms" className="input-label">
                    Bedrooms
                  </label>
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleChange}
                    className="select-input"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div className="input-container">
                  <label htmlFor="bathrooms" className="input-label">
                    Bathrooms
                  </label>
                  <select
                    id="bathrooms"
                    name="bathrooms"
                    value={filters.bathrooms}
                    onChange={handleChange}
                    className="select-input"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Square Feet */}
            <div className="form-section">
              <h3 className="section-title">Square Feet</h3>
              <div className="input-group">
                <div className="input-container">
                  <label htmlFor="minSquareFeet" className="input-label">
                    Min
                  </label>
                  <input
                    type="number"
                    id="minSquareFeet"
                    name="minSquareFeet"
                    value={filters.minSquareFeet}
                    onChange={handleChange}
                    className="text-input"
                    placeholder="Min sq.ft"
                  />
                </div>
                <div className="input-container">
                  <label htmlFor="maxSquareFeet" className="input-label">
                    Max
                  </label>
                  <input
                    type="number"
                    id="maxSquareFeet"
                    name="maxSquareFeet"
                    value={filters.maxSquareFeet}
                    onChange={handleChange}
                    className="text-input"
                    placeholder="Max sq.ft"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="amenities-section">
              <h3 className="section-title">Amenities</h3>
              <div className="amenities-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="furnished"
                    checked={filters.furnished}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Furnished
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="airConditioning"
                    checked={filters.airConditioning}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Air Conditioning
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="parking"
                    checked={filters.parking}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Parking
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="gym"
                    checked={filters.gym}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Gym
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="swimmingPool"
                    checked={filters.swimmingPool}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Swimming Pool
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="internet"
                    checked={filters.internet}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Internet
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="petFriendly"
                    checked={filters.petFriendly}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Pet Friendly
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="garden"
                    checked={filters.garden}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Garden
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="security"
                    checked={filters.security}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Security
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="balcony"
                    checked={filters.balcony}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Balcony
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="elevator"
                    checked={filters.elevator}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Elevator
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="wheelchairAccess"
                    checked={filters.wheelchairAccess}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  Wheelchair Access
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              className="reset-button"
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="apply-button"
            >
              Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdvancedSearch;