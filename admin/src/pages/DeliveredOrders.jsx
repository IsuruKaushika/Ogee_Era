import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const DeliveredOrders = ({ token }) => {
  const [orders, setOrders] = useState([])

  // Fetch delivered orders from backend
  const fetchAllOrders = async () => {
    if (!token) return
    try {
      const response = await axios.post(
        backendUrl + '/api/order/list',
        {},
        { headers: { token } }
      )

      if (response.data.success) {
        const deliveredOrders = response.data.orders.filter(
          order => order.status === 'Delivered'
        )
        setOrders(deliveredOrders)
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

  // Send a single order to Google Sheets
  const sendToSheet = async (order) => {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxinYsjywcp0UZxfcJ572C6Qcpb3cpqxbq5-PGkPg6E6NHwXNcwZ2wC5F0PVMCJp-8AkA/exec'

    const formData = new URLSearchParams()
    formData.append('orderId', order._id)
    formData.append('name', `${order.address.firstName} ${order.address.lastName}`)
    formData.append('phone', order.address.phone)
    formData.append(
      'items',
      order.items.map(item => `${item.name} x${item.quantity} (${item.size})`).join(', ')
    )
    formData.append(
      'address',
      `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`
    )
    formData.append('amount', order.amount)
    formData.append('paymentMethod', order.paymentMethod)
    formData.append('payment', order.payment ? 'Done' : 'Pending')
    formData.append('date', new Date(order.date).toLocaleDateString())

    try {
      const res = await fetch(scriptURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      const text = await res.text()
      // Optionally, you can check for success in the response text
      return true
    } catch (err) {
      toast.error('Error sending to sheet: ' + err.message)
      return false
    }
  }

  // Delete order from backend
  const deleteOrder = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/delete',
        { orderId },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Order deleted successfully')
        fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Handle delete: first send to sheet, then delete from backend
  const handleDelete = async (order) => {
    const success = await sendToSheet(order)
    if (success) {
      await deleteOrder(order._id)
    } else {
      toast.error('Order not deleted because it was not added to the sheet.')
    }
  }

  const handleSendAll = () => {
    if (orders.length === 0) {
      toast.info('No delivered orders to send.')
      return
    }
    orders.forEach(order => sendToSheet(order))
  }

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: newStatus },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(`Order status updated to: ${newStatus}`)
        fetchAllOrders()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h3 className="text-xl font-bold mb-4">Delivered Orders</h3>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          {orders.length} delivered order{orders.length !== 1 ? 's' : ''}
        </p>
        
      </div>
      <div>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            >
              <img className="w-12" src={assets.parcel_icon} alt="Parcel" />
              <div>
                {order.items.map((item, idx) => (
                  <p className="py-0.5" key={idx}>
                    {item.name} x {item.quantity}
                    <span>{item.size}{idx !== order.items.length - 1 ? ',' : ''}</span>
                  </p>
                ))}
                <p className="mt-3 mb-2 font-medium">
                  {order.address.firstName + ' ' + order.address.lastName}
                </p>
                <div>
                  <p>{order.address.street + ','}</p>
                  <p>
                    {order.address.city + ', ' + order.address.state + ', ' + order.address.country + ', ' + order.address.zipcode}
                  </p>
                </div>
                <p>{order.address.phone}</p>
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
                className="p-2 font-semibold"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Delivered">Delivered</option>
              </select>
              {/* Delete Button */}
           <button
  onClick={() => handleDelete(order)}
  className="bg-red-500 text-white min-w-[180px] py-2 rounded hover:bg-red-600 text-xs mt-2"
>
  Delete And Send to Sheet
</button>


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
