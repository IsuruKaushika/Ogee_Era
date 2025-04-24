import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentFailed = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("Payment failed or was cancelled.");

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
