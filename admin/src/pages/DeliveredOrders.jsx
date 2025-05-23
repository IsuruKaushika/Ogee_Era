import React from 'react'
import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const DeliveredOrders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])

  // Google Apps Script configuration
  const APPS_SCRIPT_CONFIG = {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbx_V8sCtfaUL5eSOZX525LF4wEL-1tLyq5S1z-sA04RV7tAaZlw7mPSrSz0qs6Az322/exec',
  }

  /**
   * Call Google Apps Script to export data
   */
  const callAppsScript = async (action, data) => {
    // Check if URL is configured (you can customize this check)
    if (!APPS_SCRIPT_CONFIG.webAppUrl) {
      throw new Error('Please configure your Google Apps Script Web App URL first!')
    }

    try {
      console.log('Calling Apps Script with:', { action, data })
      
      const requestBody = {
        action: action,
        ...data
      }
      
      console.log('Request body:', requestBody)

      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(APPS_SCRIPT_CONFIG.webAppUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Apps Script response:', result)
      
      if (!result.success) {
        throw new Error(result.message || result.error || 'Apps Script request failed')
      }
      
      return result
    } catch (error) {
      console.error('Apps Script Error Details:', {
        message: error.message,
        stack: error.stack,
        url: APPS_SCRIPT_CONFIG.webAppUrl
      })
      
      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Google Apps Script took too long to respond')
      } else if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to Google Apps Script. This might be due to:\n1. CORS policy restrictions\n2. Apps Script not deployed properly\n3. Network connectivity issues\n4. Apps Script URL is incorrect')
      }
      
      throw error
    }
  }

  /**
   * Export single order and delete from database
   */
  const exportAndDeleteOrder = async (singleOrder) => {
    if (!singleOrder) {
      toast.error('No order selected for export')
      return
    }

    // Show confirmation dialog
    const customerName = `${singleOrder.address?.firstName || 'Unknown'} ${singleOrder.address?.lastName || ''}`
    if (!window.confirm(`Export this order to Google Sheets and delete it from the database?\n\nOrder ID: ${singleOrder._id}\nCustomer: ${customerName}\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      // Try Google Apps Script first
      try {
        await callAppsScript('exportOrder', { order: singleOrder })
        toast.success('Order exported to Google Sheets successfully!')
      } catch (appsScriptError) {
        console.warn('Apps Script failed, falling back to CSV download:', appsScriptError.message)
        
        // Fallback: Download as CSV
        exportSingleOrderToCSV(singleOrder)
        toast.warning('Could not connect to Google Sheets. Downloaded as CSV instead. Please import manually.')
      }

      // If export successful (or fallback used), then delete from database
      const deleteResponse = await axios.post(backendUrl + '/api/order/delete', 
        { orderId: singleOrder._id }, 
        { headers: { token } }
      )

      if (deleteResponse.data.success) {
        toast.success('Order deleted from database successfully!')
        fetchAllOrders() // Refresh the orders list
      } else {
        toast.error('Export completed, but failed to delete order from database: ' + (deleteResponse.data.message || 'Unknown error'))
      }

    } catch (error) {
      console.error('Error in export and delete process:', error)
      toast.error('Failed to complete the operation: ' + error.message)
    }
  }

  /**
   * Export single order to CSV (fallback method)
   */
  const exportSingleOrderToCSV = (order) => {
    try {
      const headers = [
        'Order ID',
        'Order Date',
        'Customer Name',
        'Phone',
        'Address',
        'Items',
        'Total Items',
        'Payment Method',
        'Payment Status',
        'Order Amount',
        'Status',
        'Exported Date'
      ]

      const customerName = `${order.address?.firstName || 'N/A'} ${order.address?.lastName || ''}`
      const phone = order.address?.phone || 'N/A'
      const address = order.address ? 
        `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.state || ''}, ${order.address.country || ''} ${order.address.zipcode || ''}`.replace(/^,\s*|,\s*$/g, '') : 
        'N/A'
      const items = order.items?.map(item => 
        `${item.name || 'Unknown'} x ${item.quantity || 0} ${item.size ? `(${item.size})` : ''}`
      ).join('; ') || 'No items'

      const csvData = [[
        order._id || 'N/A',
        order.date ? new Date(order.date).toLocaleDateString() : 'N/A',
        `"${customerName}"`,
        phone,
        `"${address}"`,
        `"${items}"`,
        order.items?.length || 0,
        order.paymentMethod || 'N/A',
        order.payment ? 'Done' : 'Pending',
        order.amount || 0,
        order.status || 'N/A',
        new Date().toLocaleDateString()
      ]]

      const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Order_${order._id}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generating single order CSV:', error)
      toast.error('Failed to generate CSV file')
    }
  }

  /**
   * Export all orders to Google Sheets
   */
  const exportToGoogleSheets = async (singleOrder = null) => {
    const ordersToExport = singleOrder ? [singleOrder] : orders;
    
    if (ordersToExport.length === 0) {
      toast.error('No delivered orders to export')
      return
    }

    try {
      const action = singleOrder ? 'exportOrder' : 'exportOrders'
      const data = singleOrder ? { order: singleOrder } : { orders: ordersToExport }
      
      await callAppsScript(action, data)
      
      const message = singleOrder ? 'Order exported to Google Sheets successfully!' : `${ordersToExport.length} orders exported to Google Sheets successfully!`
      toast.success(message)
      
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error)
      toast.error('Failed to export to Google Sheets: ' + error.message)
    }
  }

  /**
   * Test Google Apps Script connection
   */
  const testAppsScript = async () => {
    try {
      const result = await callAppsScript('checkSheet', {})
      toast.success(`Connected to Google Sheets! Sheet: ${result.sheetName || 'Unknown'}, Rows: ${result.lastRow || 0}`)
      console.log('Apps Script Test Result:', result)
    } catch (error) {
      toast.error('Failed to connect to Google Apps Script: ' + error.message)
    }
  }

  // Alternative method: Generate CSV and provide instructions for Google Sheets
  const exportToCSV = () => {
    if (orders.length === 0) {
      toast.error('No delivered orders to export')
      return
    }

    try {
      // Prepare CSV data
      const headers = [
        'Order ID',
        'Order Date',
        'Customer Name',
        'Phone',
        'Address',
        'Items',
        'Total Items',
        'Payment Method',
        'Payment Status',
        'Order Amount',
        'Status',
        'Delivered Date'
      ]

      const csvData = orders.map(order => {
        // Safe data extraction with fallbacks
        const customerName = `${order.address?.firstName || 'N/A'} ${order.address?.lastName || ''}`
        const phone = order.address?.phone || 'N/A'
        const address = order.address ? 
          `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.state || ''}, ${order.address.country || ''} ${order.address.zipcode || ''}`.replace(/^,\s*|,\s*$/g, '') : 
          'N/A'
        const items = order.items?.map(item => 
          `${item.name || 'Unknown'} x ${item.quantity || 0} ${item.size ? `(${item.size})` : ''}`
        ).join('; ') || 'No items'

        return [
          order._id || 'N/A',
          order.date ? new Date(order.date).toLocaleDateString() : 'N/A',
          `"${customerName}"`,
          phone,
          `"${address}"`,
          `"${items}"`,
          order.items?.length || 0,
          order.paymentMethod || 'N/A',
          order.payment ? 'Done' : 'Pending',
          order.amount || 0,
          order.status || 'N/A',
          new Date().toLocaleDateString()
        ]
      })

      // Create CSV content
      const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n')

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Delivered_Orders_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('CSV file downloaded! You can import this into Google Sheets.')
      
      // Show instructions
      setTimeout(() => {
        toast.info('To import: Open Google Sheets → File → Import → Upload → Select your CSV file')
      }, 2000)

    } catch (error) {
      console.error('Error generating CSV:', error)
      toast.error('Failed to generate CSV file')
    }
  }

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this delivered order? This action cannot be undone.')) {
      return
    }

    try {
      const response = await axios.post(backendUrl + '/api/order/delete', 
        { orderId }, 
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Order deleted successfully')
        fetchAllOrders()
      } else {
        toast.error(response.data.message || 'Failed to delete order')
      }
    } catch (error) {
      console.error('Delete order error:', error)
      toast.error('Error deleting order')
    }
  }

  const deleteSelectedOrders = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to delete')
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} selected orders? This action cannot be undone.`)) {
      return
    }

    try {
      const deletePromises = selectedOrders.map(orderId =>
        axios.post(backendUrl + '/api/order/delete', 
          { orderId }, 
          { headers: { token } }
        )
      )

      const results = await Promise.allSettled(deletePromises)
      const successCount = results.filter(result => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      if (successCount > 0) {
        toast.success(`${successCount} orders deleted successfully`)
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} orders failed to delete`)
      }

      setSelectedOrders([])
      fetchAllOrders()
    } catch (error) {
      console.error('Delete selected orders error:', error)
      toast.error('Error deleting selected orders')
    }
  }

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(order => order._id))
    }
  }

  const fetchAllOrders = useCallback(async () => {
    if (!token) {
      return null
    }
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        // Filter to only show "Delivered" orders
        const deliveredOrders = response.data.orders.filter(order => order.status === 'Delivered')
        setOrders(deliveredOrders)
      } else {
        toast.error(response.data.message || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Fetch orders error:', error)
      toast.error('Error fetching orders')
    }
  }, [token])

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
      } else {
        toast.error(response.data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Error updating status')
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [fetchAllOrders])

  return (
    <div className="container mx-auto px-4">
      <h3 className="text-xl font-bold mb-4">Delivered Orders</h3>
      
      {/* Orders Count and Action Buttons */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-gray-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''} delivered
          {selectedOrders.length > 0 && ` (${selectedOrders.length} selected)`}
        </p>
        
        {orders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportToGoogleSheets()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
            >
              📊 Export to Google Sheets
            </button>
            
            <button
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
            >
              📋 Download CSV
            </button>
            
            <button
              onClick={testAppsScript}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
            >
              🔗 Test Connection
            </button>
            
            {selectedOrders.length > 0 && (
              <button
                onClick={deleteSelectedOrders}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
              >
                🗑️ Delete Selected ({selectedOrders.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Select All Checkbox */}
      {orders.length > 0 && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-gray-50 rounded">
          <input
            type="checkbox"
            id="selectAll"
            checked={selectedOrders.length === orders.length}
            onChange={handleSelectAll}
            className="w-4 h-4"
          />
          <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
            Select All Orders
          </label>
        </div>
      )}

      {/* Orders List */}
      <div>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[auto_0.5fr_2fr_1fr] lg:grid-cols-[auto_0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-green-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={order._id || index}>
              {/* Checkbox */}
              <div className="flex items-start pt-2">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order._id)}
                  onChange={() => handleSelectOrder(order._id)}
                  className="w-4 h-4 mt-1"
                />
              </div>
              
              <img className='w-12' src={assets.parcel_icon} alt="Parcel" />
              <div>
                <div>
                  {order.items?.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5' key={index}>{item.name || 'Unknown'} x {item.quantity || 0}<span>{item.size ? ` (${item.size})` : ''}</span></p>
                    } else {
                      return <p className='py-0.5' key={index}>{item.name || 'Unknown'} x {item.quantity || 0}<span>{item.size ? ` (${item.size})` : ''},</span></p>
                    }
                  }) || <p>No items found</p>}
                </div>
                <p className='mt-3 mb-2 font-medium'>{(order.address?.firstName || 'Unknown') + " " + (order.address?.lastName || '')}</p>
                <div>
                  <p>{(order.address?.street || '') + (order.address?.street ? "," : '')}</p>
                  <p>{[order.address?.city, order.address?.state, order.address?.country, order.address?.zipcode].filter(Boolean).join(', ')}</p>
                </div>
                <p>{order.address?.phone || 'No phone'}</p>
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items: {order.items?.length || 0}</p>
                <p className='mt-3'>Method: {order.paymentMethod || 'N/A'}</p>
                <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                <p>Date: {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{currency}{order.amount || 0}</p>
              <div className='flex flex-col gap-2'>
                <select 
                  onChange={(event) => statusHandler(event, order._id)} 
                  value={order.status || 'Order Placed'} 
                  className='p-2 font-semibold bg-green-50'
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Print Label and Pack">Packing</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  onClick={() => exportAndDeleteOrder(order)}
                  className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors'
                >
                  Export & Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders delivered yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveredOrders