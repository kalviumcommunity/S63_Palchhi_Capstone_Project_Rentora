import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PropertyListingForm from '../components/PropertyListingForm';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`/api/listings/${id}`);
        setListing(response.data.data);
      } catch (error) {
        toast.error('Failed to fetch listing details');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PropertyListingForm listing={listing} />
    </div>
  );
};

export default EditListing; 