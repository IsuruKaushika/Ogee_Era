import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const DeliveredOrders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [processingId, setProcessingId] = useState(null)
  const [isBulkLoading, setIsBulkLoading] = useState(false)

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
    formData.append('orderId', order._id || '')
    const customerName = order.address
      ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim()
      : ''
    formData.append('name', customerName)
    formData.append('phone', order.address?.phone || '')
    formData.append(
      'items',
      (order.items || []).map(item => `${item.name} x${item.quantity} (${item.size})`).join(', ')
    )
    const formattedAddress = order.address
      ? [order.address.street, order.address.city, order.address.state, order.address.country, order.address.zipcode].filter(Boolean).join(', ')
      : ''
    formData.append('address', formattedAddress)
    formData.append('amount', order.amount ?? '')
    formData.append('paymentMethod', order.paymentMethod || '')
    formData.append('payment', order.payment ? 'Done' : 'Pending')
    formData.append('date', order.date ? new Date(order.date).toLocaleDateString() : '')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return true
    } catch (err) {
      console.warn('Error sending to sheet:', err)
      return false
    }
  }

  // Delete order from backend
  const deleteOrder = async (orderId, showSuccessToast = true) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/delete',
        { orderId },
        { headers: { token } }
      )
      if (response.data.success) {
        if (showSuccessToast) {
          toast.success('Order deleted successfully')
        }
        fetchAllOrders()
        return true
      } else {
        toast.error(response.data.message)
        return false
      }
    } catch (error) {
      toast.error(error.message)
      return false
    }
  }

  // Handle delete: try sending to sheet first; if it fails/is not working, delete without sending to sheet
  const handleDelete = async (order) => {
    if (!window.confirm('Delete this delivered order? It will be sent to Google Sheet first.')) {
      return
    }

    setProcessingId(order._id)
    try {
      const sheetSuccess = await sendToSheet(order)
      if (sheetSuccess) {
        const deleted = await deleteOrder(order._id, false)
        if (deleted) {
          toast.success('Order saved to Sheet & deleted successfully')
        }
      } else {
        // Fallback: if sheet is not working, delete without sending to sheet!
        toast.warn('Could not send to Google Sheet. Deleting from database anyway...')
        const deleted = await deleteOrder(order._id, false)
        if (deleted) {
          toast.success('Order deleted from database without Sheet sync')
        }
      }
    } catch (err) {
      toast.error('Error during deletion: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  // Direct delete without sending to sheet
  const handleDeleteOnly = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order WITHOUT sending to Google Sheet?')) {
      return
    }

    setProcessingId(orderId)
    try {
      await deleteOrder(orderId, true)
    } finally {
      setProcessingId(null)
    }
  }

  // Send all delivered orders to sheet
  const handleSendAll = async () => {
    if (orders.length === 0) {
      toast.info('No delivered orders to send.')
      return
    }

    setIsBulkLoading(true)
    let successCount = 0
    let failCount = 0

    try {
      for (const order of orders) {
        const success = await sendToSheet(order)
        if (success) successCount++
        else failCount++
      }

      if (failCount === 0) {
        toast.success(`Successfully sent ${successCount} orders to Google Sheet.`)
      } else {
        toast.warn(`Sent ${successCount} orders to sheet (${failCount} failed).`)
      }
    } catch (err) {
      toast.error('Error sending all to sheet: ' + err.message)
    } finally {
      setIsBulkLoading(false)
    }
  }

  // Delete all delivered orders without sending to sheet
  const handleDeleteAll = async () => {
    if (orders.length === 0) {
      toast.info('No delivered orders to delete.')
      return
    }

    if (!window.confirm(`Are you sure you want to delete all ${orders.length} delivered orders without sending to Google Sheet? This cannot be undone.`)) {
      return
    }

    setIsBulkLoading(true)
    try {
      const orderIds = orders.map(order => order._id)
      const response = await axios.post(
        backendUrl + '/api/order/delete',
        { orderIds },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(`All ${orders.length} delivered orders deleted successfully`)
        fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsBulkLoading(false)
    }
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
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <p className="text-sm text-gray-600">
          {orders.length} delivered order{orders.length !== 1 ? 's' : ''}
        </p>
        {orders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSendAll}
              disabled={isBulkLoading || processingId !== null}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-medium transition duration-150"
            >
              {isBulkLoading ? 'Processing...' : 'Send All to Sheet'}
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={isBulkLoading || processingId !== null}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-medium transition duration-150"
            >
              {isBulkLoading ? 'Deleting...' : 'Delete All (Without Sheet)'}
            </button>
          </div>
        )}
      </div>
      <div>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1.2fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
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
              <div className="flex flex-col gap-2 w-full">
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                  className="p-2 font-semibold border border-gray-300 rounded text-xs"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  disabled={processingId === order._id || isBulkLoading}
                  onClick={() => handleDelete(order)}
                  className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 disabled:opacity-50 text-xs font-medium transition duration-150"
                >
                  {processingId === order._id ? 'Processing...' : 'Delete And Send to Sheet'}
                </button>
                <button
                  disabled={processingId === order._id || isBulkLoading}
                  onClick={() => handleDeleteOnly(order._id)}
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 border border-gray-300 py-1.5 px-3 rounded text-xs font-medium transition duration-150"
                >
                  Delete Only (Without Sheet)
                </button>
              </div>
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
