import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [filters, setFilters] = useState({
    paymentMethod: '',
    status: ''
  })

  const fetchAllOrders = async () => {
    if (!token) {
      return null
    }
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders)
        setFilteredOrders(response.data.orders)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value
    try {
      const response = await axios.post(backendUrl + '/api/order/status', 
        { orderId, status: newStatus }, 
        { headers: { token } }
      )
      if (response.data.success) {
        // Show success notification with the new status
        toast.success(`Order status updated to: ${newStatus}`)
        fetchAllOrders()
      }
    } catch (error) {
      console.log(error.message)
      toast.error(error.message)
    }
  }

  const filterOrders = () => {
    let result = [...orders]
    
    if (filters.paymentMethod) {
      result = result.filter(order => order.paymentMethod === filters.paymentMethod)
    }
    
    if (filters.status) {
      result = result.filter(order => order.status === filters.status)
    }
    
    setFilteredOrders(result)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      paymentMethod: '',
      status: ''
    })
    setFilteredOrders(orders)
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  useEffect(() => {
    filterOrders()
  }, [filters, orders])

  // Extract unique statuses for the filter dropdown
  const uniqueStatuses = [...new Set(orders.map(order => order.status))]

  return (
    <div className="container mx-auto px-4">
      <h3 className="text-xl font-bold mb-4">Order Page</h3>
      
      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-medium mb-3">Filters</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Payment Methods</option>
              <option value="COD">Cash on Delivery</option>
              <option value="Payhere">Payhere</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((status, idx) => (
                <option key={idx} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Orders Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {/* Orders List */}
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-12' src={assets.parcel_icon} alt="Parcel" />
              <div>
                <div>
                  {order.items.map((item, index) => {
                    if (index == order.items.length - 1) {
                      return <p className='py-0.5' key={index}>{item.name} x {item.quantity}<span>{item.size}</span></p>
                    } else {
                      return <p className='py-0.5' key={index}>{item.name} x {item.quantity}<span>{item.size},</span></p>
                    }
                  })}
                </div>
                <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>{order.address.city + ", " + order.address.state + ', ' + order.address.country + ', ' + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items: {order.items.length}</p>
                <p className='mt-3'>Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{currency}{order.amount}</p>
              <select 
                onChange={(event) => statusHandler(event, order._id)} 
                value={order.status} 
                className='p-2 font-semibold'
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Print Label and Pack">Packing</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders