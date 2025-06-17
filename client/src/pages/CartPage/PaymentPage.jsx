// src/pages/PaymentPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const PaymentPage = () => {
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const toast = useToast();
  const { userId } = useParams();

  const handlePayment = () => {
    // You can integrate with Razorpay, Stripe, etc. here
    toast({
      title: 'Payment Successful!',
      description: `Thank you for your payment.`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="500px" mx="auto" mt={10} mb={10} p={6} boxShadow="md" borderRadius="md">
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Complete Payment
      </Text>

      <RadioGroup onChange={setMethod} value={method} mb={4}>
        <Stack spacing={3}>
          <Radio value="card">Credit / Debit Card</Radio>
          <Radio value="upi">UPI</Radio>
          <Radio value="cod">Cash on Delivery</Radio>
        </Stack>
      </RadioGroup>

      {method === 'card' && (
        <Input
          placeholder="Enter card number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          mb={4}
        />
      )}

      {method === 'upi' && (
        <Input placeholder="Enter UPI ID" mb={4} />
      )}

      <Button colorScheme="teal" w="full" onClick={handlePayment}>
        Pay Now
      </Button>
      
    </Box>
  );
};

export default PaymentPage;
