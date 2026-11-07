import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

// Delivered orders are a permanent record and are never deleted (they feed the Reports page).
const DeliveredOrders = ({ token }) => {
  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {
    if (!token) return
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.filter(order => order.status === 'Delivered'))
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value
    if (newStatus === 'Cancelled' && !window.confirm('Cancel this order? Its stock will be put back.')) return
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: newStatus },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(`Order status updated to: ${newStatus}`)
        fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h3 className="text-xl font-bold mb-4">Delivered Orders</h3>
      <p className="text-sm text-gray-600 mb-4">
        {orders.length} delivered order{orders.length !== 1 ? 's' : ''}. Orders are kept permanently. Use the Reports page for income and history.
      </p>
      <div>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1.2fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            >
              <img className="w-12" src={assets.parcel_icon} alt="Parcel" />
              <div>
                {order.items.map((item, idx) => (
                  <p className="py-0.5" key={idx}>
                    {item.name} x {item.quantity}
                    <span> {item.size}{idx !== order.items.length - 1 ? ',' : ''}</span>
                  </p>
                ))}
                <p className="mt-3 mb-2 font-medium">
                  {order.address?.firstName + ' ' + order.address?.lastName}
                </p>
                <div>
                  <p>{order.address?.street + ','}</p>
                  <p>
                    {order.address?.city + ', ' + order.address?.state + ', ' + order.address?.country + ', ' + order.address?.zipcode}
                  </p>
                </div>
                <p>{order.address?.phone}</p>
              </div>
              <div>
                <p className="text-sm sm:text-[15px]">Items: {order.items.length}</p>
                <p className="mt-3">Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className="text-sm sm:text-[15px]">
                {currency}
                {order.amount}
              </p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 font-semibold border border-gray-300 rounded text-xs"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No delivered orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveredOrders
