import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import PropertyListingForm from '../components/PropertyListingForm';
import '../styles/PropertyListingForm.css';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axiosInstance.get(`/listings/${id}`);
        if (response.data.success) {
          setListing(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch listing');
          toast.error(response.data.message || 'Failed to fetch listing');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError(error.response?.data?.message || 'Failed to fetch listing');
        toast.error(error.response?.data?.message || 'Failed to fetch listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 text-center">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading listing details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 text-center">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => navigate('/my-listings')}
            >
              Back to My Listings
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Property Listing</h1>
        {listing && <PropertyListingForm listing={listing} />}
      </div>
      <Footer />
    </>
  );
};

export default EditListing; 