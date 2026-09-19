import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    toast.error("Payment failed or was cancelled.");

    // Mark the unpaid attempt as Cancelled so it doesn't linger as pending
    const orderId = searchParams.get('order_id');
    const token = localStorage.getItem('token');
    if (orderId && token) {
      axios
        .post(
          import.meta.env.VITE_BACKEND_URL + '/api/order/cancel-pending',
          { orderId },
          { headers: { token } },
        )
        .catch(() => {});
    }

    const timer = setTimeout(() => {
      navigate('/cart'); // or navigate('/') to go back to home
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>
      <p className="text-lg text-gray-700">Your payment was unsuccessful or cancelled.</p>
      <p className="text-sm text-gray-500 mt-2">Redirecting you back to your cart...</p>
    </div>
  );
};

export default PaymentFailed;
