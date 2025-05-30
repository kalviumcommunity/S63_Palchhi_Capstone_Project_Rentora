import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createTokenBooking } from '../../redux/actions/tokenBookingActions';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';

const TokenBookingForm = ({ property }) => {
  const [formData, setFormData] = useState({
    tokenAmount: '',
    bookingType: 'rent',
    duration: '',
    paymentMethod: 'online',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        propertyId: property._id,
        ...formData,
        tokenAmount: Number(formData.tokenAmount),
        duration: formData.bookingType === 'rent' ? Number(formData.duration) : undefined
      };

      await dispatch(createTokenBooking(bookingData));
      toast({
        title: 'Token booking created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      navigate('/my-bookings');
    } catch (error) {
      toast({
        title: 'Error creating token booking',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md">Token Booking Form</Heading>
        
        <Text>
          Property Value: ₹{property.price.toLocaleString()}
        </Text>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Token Amount (₹)</FormLabel>
              <NumberInput
                min={0}
                max={property.price}
                value={formData.tokenAmount}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, tokenAmount: value }))
                }
              >
                <NumberInputField name="tokenAmount" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Booking Type</FormLabel>
              <Select
                name="bookingType"
                value={formData.bookingType}
                onChange={handleChange}
              >
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </Select>
            </FormControl>

            {formData.bookingType === 'rent' && (
              <FormControl isRequired>
                <FormLabel>Duration (months)</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.duration}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, duration: value }))
                  }
                >
                  <NumberInputField name="duration" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            )}

            <FormControl isRequired>
              <FormLabel>Payment Method</FormLabel>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="online">Online Payment</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information you'd like to share..."
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={loading}
              loadingText="Creating Booking..."
            >
              Create Token Booking
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default TokenBookingForm; 