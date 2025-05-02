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
        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image[0]} alt=""/>
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              
              {/* Edit Button */}
              <p className='text-right md:text-center cursor-pointer text-blue-500 text-lg'>
                <Link to={`/edit/${item._id}`}>
                  <span className="hidden md:inline">Edit</span>
                  <span className="md:hidden">✏️</span>
                </Link>
              </p>
              
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