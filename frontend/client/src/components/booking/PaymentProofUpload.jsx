import React, { useState } from 'react';
import { uploadPaymentProof } from '../../api/tokenBookingApi';
import { useAuth } from '../../context/AuthContext';

const PaymentProofUpload = ({ bookingId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a valid file (JPG, PNG, or PDF)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('File size should be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!user) {
      setError('Please log in to upload payment proof');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('paymentProof', file);
      formData.append('userId', user._id);

      console.log('Uploading payment proof for booking:', bookingId);
      const response = await uploadPaymentProof(bookingId, formData);
      
      console.log('Upload response:', response);
      
      if (response.success) {
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      } else {
        setError(response.message || 'Failed to upload payment proof');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload payment proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="payment-proof-upload">
      <h3>Upload Payment Proof</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="paymentProof">Select File</label>
          <input
            type="file"
            id="paymentProof"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <small className="form-text text-muted">
            Accepted formats: JPG, PNG, PDF (max 5MB)
          </small>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Payment Proof'}
        </button>
      </form>
    </div>
  );
};

export default PaymentProofUpload; 