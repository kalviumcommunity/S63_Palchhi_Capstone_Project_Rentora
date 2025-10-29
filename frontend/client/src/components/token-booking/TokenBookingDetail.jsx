import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTokenBooking, cancelTokenBooking, uploadPaymentProof } from '../../redux/actions/tokenBookingActions';
import { API_URL } from '../../config';
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  HStack,
  Badge,
  Image,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  useColorModeValue,
  Divider,
  Flex,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaFilePdf } from 'react-icons/fa';

const TokenBookingDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { currentBooking: booking, loading: bookingLoading, error } = useSelector(
    (state) => state.tokenBooking
  );

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    dispatch(getTokenBooking(id));
  }, [dispatch, id]);

  const handleCancelBooking = async () => {
    try {
      await dispatch(cancelTokenBooking(id, cancellationReason));
      toast({
        title: 'Booking cancelled successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      onClose();
      navigate('/my-bookings');
    } catch (error) {
      toast({
        title: 'Error cancelling booking',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadProof = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        status: 'warning',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or PDF file',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    const formData = new FormData();
    formData.append('paymentProof', selectedFile);

    try {
      setLoading(true);
      await dispatch(uploadPaymentProof(id, formData));
      
      toast({
        title: 'Payment proof uploaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error uploading payment proof',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '/default-property.png';
    
    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;
    
    // If it's a payment proof path
    if (path.includes('payment_proofs')) {
      const baseUrl = API_URL;
      // Extract just the filename if it's a full path
      const filename = path.includes('\\') ? path.split('\\').pop() : path.split('/').pop();
      const fullUrl = `${baseUrl}/uploads/payment_proofs/${filename}`;
      
      console.log('Payment proof URL:', {
        originalPath: path,
        filename,
        constructedUrl: fullUrl
      });
      
      return fullUrl;
    }
    
  // For property images
  const baseUrl = API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`.replace(/([^:]\/)\/+/g, '$1');
    
    return fullUrl;
  };

  if (bookingLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!booking) {
    return (
      <Alert status="info">
        <AlertIcon />
        Booking not found
      </Alert>
    );
  }

  return (
    <Box
      maxW="4xl"
      mx="auto"
      p={6}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Token Booking Details</Heading>

        <Box>
          <Heading size="md" mb={4}>
            Property Information
          </Heading>
          <Flex>
            <Image
              src={getImageUrl(booking.property?.images?.[0])}
              alt={booking.property?.title || 'Property Image'}
              boxSize="200px"
              objectFit="cover"
              borderRadius="md"
              mr={6}
              onError={(e) => {
                console.error('Property image load error:', e);
                e.target.onerror = null;
                e.target.src = '/default-property.png';
              }}
            />
            <VStack align="start" spacing={2}>
              <Text fontSize="xl" fontWeight="bold">
                {booking.property?.title || 'Property Title Not Available'}
              </Text>
              <Text>
                {booking.property?.location ? 
                  `${booking.property.location.address}, ${booking.property.location.city}, ${booking.property.location.state} ${booking.property.location.pincode}` :
                  'Location not available'
                }
              </Text>
              <Text>Total Value: ₹{(booking.totalPropertyValue || 0).toLocaleString()}</Text>
              <Badge colorScheme="blue" fontSize="md">
                {booking.bookingType?.toUpperCase() || 'N/A'}
              </Badge>
            </VStack>
          </Flex>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>
            Booking Information
          </Heading>
          <VStack align="start" spacing={3}>
            <HStack>
              <Text fontWeight="bold">Token Amount:</Text>
              <Text>₹{(booking.tokenAmount || 0).toLocaleString()}</Text>
            </HStack>
            {booking.bookingType === 'rent' && (
              <HStack>
                <Text fontWeight="bold">Duration:</Text>
                <Text>{booking.duration} months</Text>
              </HStack>
            )}
            <HStack>
              <Text fontWeight="bold">Payment Method:</Text>
              <Text textTransform="capitalize">{booking.paymentMethod}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Status:</Text>
              <Badge
                colorScheme={
                  booking.status === 'confirmed'
                    ? 'green'
                    : booking.status === 'pending'
                    ? 'yellow'
                    : 'red'
                }
              >
                {booking.status}
              </Badge>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Payment Status:</Text>
              <Badge
                colorScheme={
                  booking.paymentStatus === 'completed' ? 'green' : 'yellow'
                }
              >
                {booking.paymentStatus}
              </Badge>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Valid Until:</Text>
              <Text>{new Date(booking.validUntil).toLocaleDateString()}</Text>
            </HStack>
          </VStack>
        </Box>

        <Divider />

        {booking.notes && (
          <Box>
            <Heading size="md" mb={4}>
              Additional Notes
            </Heading>
            <Text>{booking.notes}</Text>
          </Box>
        )}

        <Divider />

        <Box>
          <Heading size="md" mb={4}>
            Payment Proof
          </Heading>
          {loading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="xl" />
            </Flex>
          ) : booking.paymentProof ? (
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold">Payment Proof Uploaded:</Text>
              <Box>
                {booking.paymentProof.endsWith('.pdf') ? (
                  <Button
                    as="a"
                    href={getImageUrl(booking.paymentProof)}
                    target="_blank"
                    rel="noopener noreferrer"
                    colorScheme="blue"
                    leftIcon={<FaFilePdf />}
                  >
                    View PDF
                  </Button>
                ) : (
                  <Box position="relative">
                    <Image
                      src={getImageUrl(booking.paymentProof)}
                      alt="Payment Proof"
                      maxW="400px"
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => window.open(getImageUrl(booking.paymentProof), '_blank')}
                      onError={(e) => {
                        console.error('Payment proof image load error:', {
                          error: e,
                          attemptedUrl: e.target.src,
                          originalPath: booking.paymentProof
                        });
                        // Try loading from the backend server directly
                        const backendUrl = `${API_URL}/uploads/payment_proofs/${booking.paymentProof.split(/[\\\/]/).pop()}`;
                        if (e.target.src !== backendUrl) {
                          e.target.src = backendUrl;
                        } else {
                          e.target.onerror = null;
                          e.target.src = '/default-property.png';
                        }
                      }}
                    />
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      Click to view full size
                    </Text>
                  </Box>
                )}
              </Box>
            </VStack>
          ) : (
            <VStack align="start" spacing={4}>
              <Text color="gray.500">No payment proof uploaded yet</Text>
              {booking.paymentStatus === 'pending' && (
                <Box>
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  <Button
                    colorScheme="blue"
                    onClick={() => document.getElementById('fileInput').click()}
                    isLoading={loading}
                    loadingText="Uploading..."
                  >
                    Upload Payment Proof
                  </Button>
                  {selectedFile && (
                    <Box mt={4}>
                      <Text mb={2}>Selected file: {selectedFile.name}</Text>
                      <Button 
                        colorScheme="green" 
                        onClick={handleUploadProof}
                        isLoading={loading}
                        loadingText="Uploading..."
                      >
                        Confirm Upload
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </VStack>
          )}
        </Box>

        <HStack spacing={4} justify="flex-end">
          {booking.status === 'pending' && (
            <>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={onOpen}
              >
                Cancel Booking
              </Button>
            </>
          )}
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={() => navigate('/my-bookings')}
          >
            Back to Bookings
          </Button>
        </HStack>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Booking</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Reason for Cancellation</FormLabel>
              <Textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this booking..."
              />
            </FormControl>
            <Button
              colorScheme="red"
              mt={4}
              onClick={handleCancelBooking}
              isDisabled={!cancellationReason}
            >
              Confirm Cancellation
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TokenBookingDetail; 