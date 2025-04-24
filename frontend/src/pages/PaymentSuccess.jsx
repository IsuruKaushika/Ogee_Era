import { useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
  const { setCartItems } = useContext(ShopContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart in frontend
    setCartItems([]);
    toast.success("Payment successful! Thank you for your order.");
    // Redirect to orders page after a short delay
    const timer = setTimeout(() => navigate('/orders'), 2000);
    return () => clearTimeout(timer);
  }, []);

  return <div className="p-6 text-xl text-center">Processing your order...</div>;
};

export default PaymentSuccess;
