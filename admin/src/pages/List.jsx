import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { backendUrl, currency } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import { MdDeleteForever } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [stockFilter, setStockFilter] = useState('All Stock')
  const [bestsellerFilter, setBestsellerFilter] = useState('All Products')
  const navigate = useNavigate()

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
    if (window.confirm('Are you sure you want to delete this product?')) {
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
  const categoryOptions = useMemo(() => {
    const categories = [...new Set(list.map((item) => item.category).filter(Boolean))]
    return ['All Categories', ...categories]
  }, [list])

  const filteredList = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return list.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          item.name,
          item.category,
          item.subCategory,
          item.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesCategory =
        categoryFilter === 'All Categories' || item.category === categoryFilter

      const matchesStock =
        stockFilter === 'All Stock' || item.stockStatus === stockFilter

      const matchesBestseller =
        bestsellerFilter === 'All Products' ||
        (bestsellerFilter === 'Bestsellers' ? item.bestseller : !item.bestseller)

      return matchesSearch && matchesCategory && matchesStock && matchesBestseller
    })
  }, [list, searchTerm, categoryFilter, stockFilter, bestsellerFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('All Categories')
    setStockFilter('All Stock')
    setBestsellerFilter('All Products')
  }

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
      <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-lg font-semibold text-gray-800'>All Product List</p>
          <p className='text-sm text-gray-500'>Search and filter products by category, stock, and bestseller status.</p>
        </div>
        <p className='text-sm text-gray-600'>
          {filteredList.length} product{filteredList.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className='mb-5 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]'>
        <input
          type='text'
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder='Search by name, category, subcategory, or description'
          className='w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500'
        />

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className='w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500'
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
          className='w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500'
        >
          <option value='All Stock'>All Stock</option>
          {stockOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={bestsellerFilter}
          onChange={(event) => setBestsellerFilter(event.target.value)}
          className='w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500'
        >
          <option value='All Products'>All Products</option>
          <option value='Bestsellers'>Bestsellers</option>
          <option value='Regular Products'>Regular Products</option>
        </select>

        <button
          type='button'
          onClick={clearFilters}
          className='rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50'
        >
          Clear
        </button>
      </div>

      <div className='flex flex-col gap-2'>
        {/*---ListTable Header---*/}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Stock Status</b>
          <b className='text-center'>Edit</b>
          <b className='text-center'>Delete</b>
        </div>
        
        {/*-------Product List-------- */}
        {
          filteredList.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
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
              {/* Edit Button */}
              <button
                onClick={() => {
                navigate(`/edit/${item._id}`)
                }}
                className='text-gray-500 hover:text-gray-700 cursor-pointer flex justify-center'
              ><TbEdit />
              </button>

              {/* Delete Button (X) */}
              <div onClick={() => removeProduct(item._id)} className=' cursor-pointer text-gray-900 flex justify-center'><MdDeleteForever size={20} className=''/></div>
            </div>
          ))
        }
        
        {/* Show message if no products */}
        {filteredList.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            No products match the current search or filters
          </div>
        )}
      </div>
    </>
  )
}

export default List
