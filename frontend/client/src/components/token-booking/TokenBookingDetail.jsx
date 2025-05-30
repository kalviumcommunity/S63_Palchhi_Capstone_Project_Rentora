import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTokenBooking, cancelTokenBooking, uploadPaymentProof } from '../../redux/actions/tokenBookingActions';
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

  const { currentBooking: booking, loading, error } = useSelector(
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

    const formData = new FormData();
    formData.append('paymentProof', selectedFile);

    try {
      await dispatch(uploadPaymentProof(id, formData));
      toast({
        title: 'Payment proof uploaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: 'Error uploading payment proof',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  if (loading) {
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
              src={booking.property?.images?.[0] || 'https://via.placeholder.com/200x200?text=No+Image'}
              alt={booking.property?.title || 'Property Image'}
              boxSize="200px"
              objectFit="cover"
              borderRadius="md"
              mr={6}
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
              <Text>Total Value: ₹{booking.totalPropertyValue?.toLocaleString() || '0'}</Text>
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
              <Text>₹{booking.tokenAmount.toLocaleString()}</Text>
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
          {booking.paymentProof ? (
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold">Payment Proof Uploaded:</Text>
              <Box>
                {booking.paymentProof.endsWith('.pdf') ? (
                  <Button
                    as="a"
                    href={booking.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    colorScheme="blue"
                    leftIcon={<FaFilePdf />}
                  >
                    View PDF
                  </Button>
                ) : (
                  <Image
                    src={booking.paymentProof}
                    alt="Payment Proof"
                    maxW="400px"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => window.open(booking.paymentProof, '_blank')}
                  />
                )}
              </Box>
            </VStack>
          ) : (
            <Text color="gray.500">No payment proof uploaded yet</Text>
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
              {booking.paymentStatus === 'pending' && (
                <Button
                  colorScheme="blue"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  Upload Payment Proof
                </Button>
              )}
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

        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,.pdf"
        />
        {selectedFile && (
          <Button colorScheme="green" onClick={handleUploadProof}>
            Confirm Upload
          </Button>
        )}
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