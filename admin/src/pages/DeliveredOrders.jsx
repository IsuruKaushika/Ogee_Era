import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const DeliveredOrders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [isUpdatingSheet, setIsUpdatingSheet] = useState(false)

  // Google Sheets configuration - REPLACE WITH YOUR VALUES
  const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: '1xXMB11r8OCFcq-ipj5TUnK8Ycmo8fS4vagR18wLf-Eo', // Get from your Google Sheet URL
    range: 'Sheet1!A:H',
    apiKey: 'AIzaSyA3AlT_u-2pIwAGOy-Th_pkvJCi1COIBeQ' // Your Google Cloud API Key
  }

  const fetchDeliveredOrders = async () => {
    if (!token) return

    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        const deliveredOrders = response.data.orders.filter(order => order.status === 'Delivered')
        setOrders(deliveredOrders)
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
        toast.success(`Order status updated to: ${newStatus}`)
        fetchDeliveredOrders()
      }
    } catch (error) {
      console.log(error.message)
      toast.error(error.message)
    }
  }

  const prepareSheetData = () => {
    const headers = [
      'Order ID',
      'Customer Name',
      'Items',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Address',
      'Date'
    ]

    const rows = orders.map(order => [
      order._id,
      `${order.address.firstName} ${order.address.lastName}`,
      order.items.map(item => `${item.name} x${item.quantity} (${item.size})`).join(', '),
      `${currency}${order.amount}`,
      order.paymentMethod,
      order.payment ? 'Done' : 'Pending',
      `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country} ${order.address.zipcode}`,
      new Date(order.date).toLocaleDateString()
    ])

    return [headers, ...rows]
  }

  // Client-side Google Sheets update (No backend required)
  const updateGoogleSheet = async () => {
    setIsUpdatingSheet(true)
    
    try {
      const sheetData = prepareSheetData()
      
      // Step 1: Clear existing data
      const clearResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${GOOGLE_SHEETS_CONFIG.range}:clear?key=${GOOGLE_SHEETS_CONFIG.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )

      if (!clearResponse.ok) {
        throw new Error('Failed to clear sheet data')
      }

      // Step 2: Add new data
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${GOOGLE_SHEETS_CONFIG.range}?valueInputOption=RAW&key=${GOOGLE_SHEETS_CONFIG.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: sheetData
          })
        }
      )

      if (updateResponse.ok) {
        const result = await updateResponse.json()
        toast.success(`Google Sheet updated! ${result.updatedCells} cells updated.`)
      } else {
        const errorData = await updateResponse.json()
        throw new Error(errorData.error?.message || 'Failed to update sheet')
      }
    } catch (error) {
      console.error('Error updating Google Sheet:', error)
      
      // Handle common errors
      if (error.message.includes('CORS')) {
        toast.error('CORS error. Try using a web app deployment or backend approach.')
      } else if (error.message.includes('403')) {
        toast.error('Permission denied. Check your API key and sheet permissions.')
      } else if (error.message.includes('404')) {
        toast.error('Sheet not found. Check your spreadsheet ID.')
      } else {
        toast.error('Error updating Google Sheet: ' + error.message)
      }
    } finally {
      setIsUpdatingSheet(false)
    }
  }

  // Alternative: Download as CSV (Always works)
  const downloadAsCSV = () => {
    try {
      const sheetData = prepareSheetData()
      const csvContent = sheetData.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `delivered-orders-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('CSV file downloaded successfully!')
    } catch (error) {
      toast.error('Error downloading CSV: ' + error.message)
    }
  }

  useEffect(() => {
    fetchDeliveredOrders()
  }, [token])

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-xl font-bold">Delivered Orders</h3>
        
        <div className="flex gap-2">
          {/* Download CSV Button (Always works) */}
          <button
            onClick={downloadAsCSV}
            disabled={orders.length === 0}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              orders.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Download CSV
          </button>

          {/* Update Google Sheet Button */}
          <button
            onClick={updateGoogleSheet}
            disabled={isUpdatingSheet || orders.length === 0}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isUpdatingSheet || orders.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isUpdatingSheet ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Google Sheet'
            )}
          </button>
        </div>
      </div>

      {/* Orders Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {orders.length} delivered order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Orders List */}
      <div>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-12' src={assets.parcel_icon} alt="Parcel" />
              <div>
                <div>
                  {order.items.map((item, index) => (
                    <p className='py-0.5' key={index}>
                      {item.name} x {item.quantity}
                      <span>{item.size}{index !== order.items.length - 1 ? ',' : ''}</span>
                    </p>
                  ))}
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
            <p className="text-gray-500">No delivered orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveredOrders