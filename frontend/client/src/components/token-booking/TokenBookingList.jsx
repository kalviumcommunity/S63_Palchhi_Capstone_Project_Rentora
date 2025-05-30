import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserTokenBookings } from '../../redux/actions/tokenBookingActions';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Text,
  Heading,
  useColorModeValue,
  Link,
  Image,
  Flex,
  Spinner,
  Alert,
  Container
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const TokenBookingList = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state) => state.tokenBooking);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    dispatch(getUserTokenBookings());
  }, [dispatch]);

  console.log('TokenBookingList state:', { bookings, loading, error });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      confirmed: 'green',
      rejected: 'red',
      cancelled: 'gray',
      completed: 'blue'
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return (
      <Box flex="1" display="flex" alignItems="center" justifyContent="center" minH="calc(100vh - 200px)">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex="1" p={8}>
        <Alert status="error">
          <WarningIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Box flex="1" p={8} display="flex" alignItems="center" justifyContent="center" minH="calc(100vh - 200px)">
        <Box textAlign="center" py={10}>
          <Heading size="md" mb={4}>
            No Token Bookings Found
          </Heading>
          <Text color="gray.500">
            You haven't made any token bookings yet. Browse properties to make a booking.
          </Text>
          <Button
            as={RouterLink}
            to="/properties"
            colorScheme="blue"
            mt={4}
          >
            Browse Properties
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex="1" p={8}>
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        maxW="container.xl"
        mx="auto"
      >
        <Box p={6}>
          <Heading size="lg" mb={6}>
            My Token Bookings
          </Heading>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Property</Th>
                <Th>Type</Th>
                <Th>Token Amount</Th>
                <Th>Status</Th>
                <Th>Payment Status</Th>
                <Th>Valid Until</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bookings.map((booking) => (
                <Tr key={booking._id}>
                  <Td>
                    <Flex align="center">
                      <Image
                        src={booking.property.images[0]}
                        alt={booking.property.title}
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                        mr={3}
                      />
                      <Box>
                        <Link
                          as={RouterLink}
                          to={`/properties/${booking.property._id}`}
                          fontWeight="medium"
                        >
                          {booking.property.title}
                        </Link>
                        <Text fontSize="sm" color="gray.500">
                          {`${booking.property.location.address}, ${booking.property.location.city}, ${booking.property.location.state} ${booking.property.location.pincode}`}
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Text textTransform="capitalize">{booking.bookingType}</Text>
                    {booking.bookingType === 'rent' && (
                      <Text fontSize="sm" color="gray.500">
                        {booking.duration} months
                      </Text>
                    )}
                  </Td>
                  <Td>₹{booking.tokenAmount.toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        booking.paymentStatus === 'completed' ? 'green' : 'yellow'
                      }
                    >
                      {booking.paymentStatus}
                    </Badge>
                  </Td>
                  <Td>
                    {new Date(booking.validUntil).toLocaleDateString()}
                  </Td>
                  <Td>
                    <Button
                      as={RouterLink}
                      to={`/bookings/${booking._id}`}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default TokenBookingList; 