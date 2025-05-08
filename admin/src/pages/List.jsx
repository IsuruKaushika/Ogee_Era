import React from 'react'
import { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')

      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success(response.data.message)
        fetchList() // refresh after deleted
      } else {
        toast.error(response.data.message)
      }
    } catch (e) {
      console.log(e)
      toast.error(e.message)
    }
  }
  
  // Updated function to use the new endpoint
  const updateStock = async (productId, newStatus) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates
    
    setIsUpdating(true)
    try {
      const response = await axios.post(
        backendUrl + '/api/product/updateStockStatus',
        { 
          productId,
          stockStatus: newStatus
        },
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success(response.data.message)
        fetchList() // refresh after update
      } else {
        toast.error(response.data.message)
      }
    } catch (e) {
      console.log(e)
      toast.error(e.message)
    } finally {
      setIsUpdating(false)
    }
  }
  
  useEffect(() => {
    fetchList()
  }, [])

  // Stock status options
  const stockOptions = ['In Stock', 'Out of Stock', 'Limited Stock']

  // Function to get background color based on stock status
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Stock':
        return 'bg-green-500';
      case 'Out of Stock':
        return 'bg-red-500';
      case 'Limited Stock':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }

  return (
    <>
      <p className='mb-2'>All Product List</p>
      <div className='flex flex-col gap-2'>
        {/*---ListTable Header---*/}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Stock Status</b>
          <b className='text-center'>Delete</b>
        </div>
        
        {/*-------Product List-------- */}
        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image[0]} alt=""/>
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              
              {/* Stock Status Dropdown */}
              <div className='text-right md:text-center'>
                <select
                  value={item.stockStatus}
                  onChange={(e) => updateStock(item._id, e.target.value)}
                  className={`px-2 py-1 rounded text-white cursor-pointer ${getStatusColor(item.stockStatus)}`}
                  disabled={isUpdating}
                >
                  {stockOptions.map(option => (
                    <option 
                      key={option} 
                      value={option}
                      className="bg-white text-gray-800"
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Delete Button (X) */}
              <p onClick={() => removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-red-500 text-lg'>X</p>
            </div>
          ))
        }
        
        {/* Show message if no products */}
        {list.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            No products found
          </div>
        )}
      </div>
    </>
  )
}

export default List