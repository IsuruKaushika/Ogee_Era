import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext'
import { useEffect } from 'react'
import ProductItem from '../components/ProductItem'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import RelatedProducts from '../components/RelatedProducts'


const Product = () => {
  const {productId} = useParams();
  const {products, currency, addToCart} = useContext(ShopContext);
  const [productData, setProductData] = useState(false)
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [showSizeChart, setShowSizeChart] = useState(false)

  const fetchProductData = async() => {
    products.map((item) => {
      if(item._id === productId){
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  // Function to render stock status with appropriate styling
  const renderStockStatus = () => {
    if (!productData.stockStatus) return null;
    
    const statusColor = {
      'In Stock': 'text-green-600',
      'Out of Stock': 'text-red-600',
      'Limited Stock': 'text-orange-500'
    }

    return (
      <div className="mt-3">
        <span className={`font-medium ${statusColor[productData.stockStatus]}`}>
          {productData.stockStatus}
        </span>
      </div>
    )
  }

  // Function to handle size chart modal
  const toggleSizeChart = () => {
    setShowSizeChart(!showSizeChart)
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*product details*/}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*product Images*/}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image.map((item, index) => (
                <img onClick={() => setImage(item)} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' src={item} alt=""/>
              ))
            }
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt=""/>
          </div>
        </div>
        
        {/*product details*/}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          
          <p className='mt-5 text-3xl font-medium'>{currency} {productData.price}</p>
          
          {/* Display stock status here */}
          {renderStockStatus()}
          
          <p className='mt-5 mb-8 text-gray-500 md:w-4/5'>{productData.description}</p>
          
          {/* Size Table - Only display if available */}
          {productData.sizeChart && (
            <div className="mt-5">
              <h3 className="font-medium mb-2">Size Table</h3>
              <img 
                src={productData.sizeChart} 
                alt="Size Table" 
                className="w-full max-w-md h-auto"
              />
            </div>
          )}
          
          {/* Only show size selection if sizes array has items */}
          {productData.sizes && productData.sizes.length > 0 && (
            <div className='flex flex-col gap-4 my-8'>
              <div className="flex justify-between items-center">
                <p>Select Size</p>
              </div>
              <div className='flex gap-2'>
                {productData.sizes.map((item, index) => (
                  <button 
                    onClick={() => setSize(item)} 
                    className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} 
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Disable Add to Cart button if out of stock */}
          <button 
            onClick={() => productData.stockStatus !== 'Out of Stock' && addToCart(productData._id, size)} 
            className={`${
              productData.stockStatus === 'Out of Stock' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-black active:bg-gray-700'
            } text-white px-8 py-3 text-sm mt-6`}
            disabled={productData.stockStatus === 'Out of Stock'}
          >
            {productData.stockStatus === 'Out of Stock' ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>
          
          <hr className='mt-8 sm:w-4/5'/>
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original Product.</p>
            <p>Cash On delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>
      
      {/* Size Chart Modal */}
      {showSizeChart && productData.sizeChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full relative p-2">
            <button 
              onClick={toggleSizeChart}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-medium p-4">Size Chart</h3>
            <div className="p-4">
              <img 
                src={productData.sizeChart} 
                alt="Size Chart" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/*related products*/}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory}/>
    </div>
  ) : <div className='opacity-0'></div>
}

export default Product