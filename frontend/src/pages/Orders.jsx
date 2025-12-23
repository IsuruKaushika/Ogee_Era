import React from 'react'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';


const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setorderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setorderData(response.data.orders.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch orders");
    }
  };
  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"YOUR"} text2={"ORDERS"} />
      </div>

      <div className="flex flex-col gap-6 mt-8">
        {orderData.map((order, orderIndex) => (
          <div
            key={orderIndex}
            className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start mb-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-500">
                  Order Date:{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(order.date).toDateString()}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Order Id:{" "}
                  <span className="font-medium text-gray-700">{order._id}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Payment Method:{" "}
                  <span className="font-medium text-gray-700">
                    {order.paymentMethod}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Paid:{" "}
                  <span className="font-medium text-gray-700">
                    {order.payment ? "Yes" : "No"}
                  </span>
                </p>
              </div>
              <div className="">
                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                  <p className="text-sm md:text-base font-semibold">
                    {order.status}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={loadOrderData}
                    className="border border-gray-300 px-6 py-2 text-sm font-medium rounded hover:bg-gray-50"
                  >
                    Track Order
                  </button>
                </div>
              </div>
            </div>

            {order.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="py-4 border-b last:border-b-0 flex items-start gap-6 text-sm"
              >
                <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
                <div className="flex-1">
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p className="text-lg">
                      {currency}
                      {item.price}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
