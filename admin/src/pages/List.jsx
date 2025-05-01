import React from 'react'
import { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const List = ({ token }) => {
  const [list, setList] = useState([])

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
      // Show confirmation dialog before deleting
      if (!window.confirm('Are you sure you want to delete this product?')) {
        return;
      }
      
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
  
  useEffect(() => {
    fetchList()
  }, [])

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
          <b className='text-center'>Edit</b>
          <b className='text-center'>Delete</b>
        </div>
        
        {/*-------Product List-------- */}
        {list.map((item, index) => (
          <div
            className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm'
            key={index}
          >
            <img className='w-12 h-12 object-cover' src={item.images && item.images[0]} alt="" />
            <p className="truncate">{item.name}</p>
            <p>{item.category}</p>
            <p>{currency}{item.price}</p>
            
            {/* Edit Button - Mobile Version Shows Icon Only */}
            <div className="flex justify-center">
              <Link
                to={`/edit-product/${item._id}`}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-flex items-center justify-center"
              >
                <span className="hidden md:inline mr-1">Edit</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            </div>
            
            {/* Delete Button - Shows X */}
            <div 
              onClick={() => removeProduct(item._id)}
              className="flex justify-center cursor-pointer text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
        ))}
        
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