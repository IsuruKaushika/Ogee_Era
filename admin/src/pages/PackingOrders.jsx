import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const PackingOrders = ({ token }) => {
  const [orders, setOrders] = useState([])

  const printLabel = (order) => {
    const printWindow = window.open('', '_blank')
    const printContent = generateLabelHTML([order])
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const printAllLabels = () => {
    if (orders.length === 0) {
      toast.error('No orders to print')
      return
    }

    const printWindow = window.open('', '_blank')
    const printContent = generateLabelHTML(orders)
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const generateLabelHTML = (ordersToPrint) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Labels - ${ordersToPrint.length} Orders</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 10px; 
            line-height: 1.4;
          }
          .label {
            border: 2px solid #000;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto 20px auto;
            page-break-after: always;
          }
          .label:last-child {
            page-break-after: avoid;
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .section {
            margin-bottom: 15px;
          }
          .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 5px;
          }
          .address {
            border: 1px solid #ccc;
            padding: 10px;
            background-color: #f9f9f9;
          }
          .items {
            border: 1px solid #ccc;
            padding: 10px;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
          }
          @media print {
            body { margin: 0; }
            .label { 
              border: 2px solid #000;
              margin-bottom: 0;
            }
          }
        </style>
      </head>
      <body>
        ${ordersToPrint.map(order => `
          <div class="label">
            <div class="header">
              <h2>SHIPPING LABEL</h2>
              <p>Order ID: ${order._id}</p>
              <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <div class="section-title">SHIP TO:</div>
              <div class="address">
                <strong>${order.address.firstName} ${order.address.lastName}</strong><br>
                ${order.address.street}<br>
                ${order.address.city}, ${order.address.state}<br>
                ${order.address.country} ${order.address.zipcode}<br>
                Phone: ${order.address.phone}
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">ORDER ITEMS:</div>
              <div class="items">
                ${order.items.map(item => 
                  `<div>${item.name} x ${item.quantity} ${item.size ? `(${item.size})` : ''}</div>`
                ).join('')}
              </div>
            </div>
            
            <div class="order-info">
              <div><strong>Payment:</strong> ${order.paymentMethod}</div>
              <div><strong>Total:</strong> ${currency}${order.amount}</div>
            </div>
            
            <div class="order-info">
              <div><strong>Items:</strong> ${order.items.length}</div>
              <div><strong>Status:</strong> ${order.payment ? 'Paid' : 'COD'}</div>
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `
  }

  const fetchAllOrders = async () => {
    if (!token) {
      return null
    }
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        // Filter to only show "Packing" orders
        const packingOrders = response.data.orders.filter(order => order.status === 'Packing')
        setOrders(packingOrders)
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

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div className="container mx-auto px-4">
      <h3 className="text-xl font-bold mb-4">Packing Orders</h3>
      
      {/* Orders Count and Print All Button */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''} ready for packing
        </p>
        {orders.length > 0 && (
          <button
            onClick={printAllLabels}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
          >
            📄 Print All Labels ({orders.length})
          </button>
        )}
      </div>

      {/* Orders List */}
      <div>
        {orders.length > 0 ? (
          orders.map((order, index) => (
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
              <div className='flex flex-col gap-2'>
                <select 
                  onChange={(event) => statusHandler(event, order._id)} 
                  value={order.status} 
                  className='p-2 font-semibold'
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  onClick={() => printLabel(order)}
                  className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors'
                >
                  Print Label
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders ready for packing</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PackingOrders